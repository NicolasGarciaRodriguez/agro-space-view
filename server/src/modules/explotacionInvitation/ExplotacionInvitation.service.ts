import crypto from "node:crypto";
import mongoose from "mongoose";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";
import { ExplotacionMiembroModel } from "../../schemas/ExplotacionMiembro.schema.js";
import { ExplotacionInvitacionModel } from "../../schemas/ExplotacionInvitacion.schema.js";
import { UserModel } from "../../schemas/User.schema.js";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { InvitacionEstado } from "@agrospace/shared/enums/InvitacionEstado.enum";
import { ResendService } from "../../services/Resend.service.js";
import {
  INVITATION_EXPIRY_DAYS,
  MAX_PENDING_INVITATIONS_PER_EXPLOTACION,
  buildInvitationEmailHtml,
} from "./ExplotacionInvitation.config.js";
import {
  InvitationNotFoundError,
  InvitationExpiredError,
  InvitationEmailMismatchError,
  InvitationForbiddenError,
  TooManyPendingInvitationsError,
  MemberNotFoundError,
} from "./ExplotacionInvitation.interface.js";

const generateToken = (): string => crypto.randomBytes(32).toString("hex");

// Comprueba que TODAS las explotaciones pertenecen al mismo dueño que
// está invitando — no se puede compartir una explotación ajena.
const assertOwnsAll = async (
  userId: string,
  explotacionIds: string[],
): Promise<void> => {
  const count = await ExplotacionModel.countDocuments({
    _id: { $in: explotacionIds },
    userId,
  });
  if (count !== explotacionIds.length) {
    throw new InvitationForbiddenError();
  }
};

const assertPendingLimitNotExceeded = async (
  explotacionIds: string[],
): Promise<void> => {
  for (const explotacionId of explotacionIds) {
    const pendientes = await ExplotacionInvitacionModel.countDocuments({
      explotacionIds: explotacionId,
      estado: InvitacionEstado.PENDIENTE,
    });
    if (pendientes >= MAX_PENDING_INVITATIONS_PER_EXPLOTACION) {
      throw new TooManyPendingInvitationsError();
    }
  }
};

const createInvitation = async (
  userId: string,
  explotacionIds: string[],
  email: string,
  nivelAcceso: NivelAcceso,
): Promise<void> => {
  await assertOwnsAll(userId, explotacionIds);
  await assertPendingLimitNotExceeded(explotacionIds);

  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  await ExplotacionInvitacionModel.create({
    explotacionIds,
    invitadoPor: userId,
    email: email.toLowerCase(),
    nivelAcceso,
    token,
    expiresAt,
    estado: InvitacionEstado.PENDIENTE,
  });

  const [invitador, explotaciones] = await Promise.all([
    UserModel.findById(userId).lean(),
    ExplotacionModel.find({ _id: { $in: explotacionIds } }, { nombre: 1 }).lean(),
  ]);

  const invitationUrl = `${process.env.FRONTEND_URL}/invitations/accept?token=${token}`;
  const html = buildInvitationEmailHtml(
    invitador?.nombre ?? "Un usuario",
    explotaciones.map((e) => e.nombre),
    invitationUrl,
  );

  await ResendService.sendEmail({
    to: email,
    subject: "Te han invitado a colaborar en AgroSpaceView",
    html,
  });
};

// Devuelve el detalle de una invitación para mostrarla antes de
// aceptar — no requiere sesión, solo el token.
const getInvitationByToken = async (token: string) => {
  const invitacion = await ExplotacionInvitacionModel.findOne({ token }).lean();
  if (!invitacion) throw new InvitationNotFoundError();

  if (invitacion.estado === InvitacionEstado.ACEPTADA) {
    throw new InvitationNotFoundError();
  }

  if (invitacion.expiresAt.getTime() < Date.now()) {
    if (invitacion.estado !== InvitacionEstado.EXPIRADA) {
      await ExplotacionInvitacionModel.updateOne(
        { _id: invitacion._id },
        { $set: { estado: InvitacionEstado.EXPIRADA } },
      );
    }
    throw new InvitationExpiredError();
  }

  const [invitador, explotaciones] = await Promise.all([
    UserModel.findById(invitacion.invitadoPor, { nombre: 1, apellidos: 1 }).lean(),
    ExplotacionModel.find(
      { _id: { $in: invitacion.explotacionIds } },
      { nombre: 1 },
    ).lean(),
  ]);

  return {
    email: invitacion.email,
    nivelAcceso: invitacion.nivelAcceso,
    invitadoPorNombre: invitador
      ? `${invitador.nombre} ${invitador.apellidos}`
      : "Un usuario",
    explotaciones: explotaciones.map((e) => ({
      id: e._id.toString(),
      nombre: e.nombre,
    })),
  };
};

// Acepta la invitación: valida que el email coincida con la cuenta
// que la acepta, y crea un ExplotacionMiembro por cada explotación.
const acceptInvitation = async (
  token: string,
  aceptanteUserId: string,
): Promise<void> => {
  const invitacion = await ExplotacionInvitacionModel.findOne({ token });
  if (!invitacion) throw new InvitationNotFoundError();

  if (invitacion.estado === InvitacionEstado.ACEPTADA) {
    throw new InvitationNotFoundError();
  }

  if (invitacion.expiresAt.getTime() < Date.now()) {
    invitacion.estado = InvitacionEstado.EXPIRADA;
    await invitacion.save();
    throw new InvitationExpiredError();
  }

  const aceptante = await UserModel.findById(aceptanteUserId).lean();
  if (!aceptante) throw new InvitationNotFoundError();

  if (aceptante.email.toLowerCase() !== invitacion.email.toLowerCase()) {
    throw new InvitationEmailMismatchError();
  }

  // Crea un ExplotacionMiembro por cada explotación de la invitación.
  // Si ya existiera (invitación repetida), se actualiza el nivel en
  // vez de fallar por duplicado.
  await Promise.all(
    invitacion.explotacionIds.map((explotacionId) =>
      ExplotacionMiembroModel.findOneAndUpdate(
        { explotacionId, userId: aceptanteUserId },
        {
          explotacionId,
          userId: aceptanteUserId,
          nivelAcceso: invitacion.nivelAcceso,
          invitadoPor: invitacion.invitadoPor,
        },
        { upsert: true },
      ),
    ),
  );

  invitacion.estado = InvitacionEstado.ACEPTADA;
  await invitacion.save();
};

// ═══════════════════════════════════════════════════════════════════
//  GESTIÓN DE COLABORADORES
// ═══════════════════════════════════════════════════════════════════

const getMiembros = async (explotacionId: string) => {
  const miembros = await ExplotacionMiembroModel.find({ explotacionId }).lean();

  const userIds = miembros.map((m) => m.userId);
  const users = await UserModel.find(
    { _id: { $in: userIds } },
    { nombre: 1, apellidos: 1, email: 1 },
  ).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return miembros.map((m) => {
    const user = userMap.get(m.userId.toString());
    return {
      id: m._id.toString(),
      userId: m.userId.toString(),
      nombre: user ? `${user.nombre} ${user.apellidos}` : "Usuario desconocido",
      email: user?.email ?? "",
      nivelAcceso: m.nivelAcceso,
      createdAt: m.createdAt,
    };
  });
};

// Solo el dueño de la explotación puede revocar un colaborador.
const removeMember = async (
  requesterId: string,
  miembroId: string,
): Promise<void> => {
  if (!mongoose.isValidObjectId(miembroId)) throw new MemberNotFoundError();

  const miembro = await ExplotacionMiembroModel.findById(miembroId);
  if (!miembro) throw new MemberNotFoundError();

  const explotacion = await ExplotacionModel.findById(
    miembro.explotacionId,
  ).lean();
  if (!explotacion || explotacion.userId.toString() !== requesterId) {
    throw new InvitationForbiddenError();
  }

  await miembro.deleteOne();
};

export const ExplotacionInvitationService = {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  getMiembros,
  removeMember,
};