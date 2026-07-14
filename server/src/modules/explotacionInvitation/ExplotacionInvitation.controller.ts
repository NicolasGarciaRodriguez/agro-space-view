import type { FastifyReply } from "fastify";
import { ExplotacionInvitationService } from "./ExplotacionInvitation.service.js";
import { UsageLimitsService } from "../usageLimits/UsageLimits.service.js";
import {
  ExplotacionAccessService,
} from "../../services/explotacionAccess/ExplotacionAccess.service.js";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import type {
  CreateInvitationRequest,
  AcceptInvitationRequest,
  GetInvitationRequest,
  RemoveMemberRequest,
  GetMiembrosRequest,
} from "./ExplotacionInvitation.interface.js";

const create = async (
  request: CreateInvitationRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { explotacionIds, email, nivelAcceso } = request.body;

  // Solo usuarios con plan Técnico pueden invitar.
  await UsageLimitsService.assertCanInviteToExplotacion(userId);

  await ExplotacionInvitationService.createInvitation(
    userId,
    explotacionIds,
    email,
    nivelAcceso,
  );

  return reply.status(201).send({ message: "Invitación enviada" });
};

const getByToken = async (
  request: GetInvitationRequest,
  reply: FastifyReply,
) => {
  const { token } = request.params;
  const invitacion = await ExplotacionInvitationService.getInvitationByToken(
    token,
  );
  return reply.send(invitacion);
};

const accept = async (
  request: AcceptInvitationRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { token } = request.params;

  await ExplotacionInvitationService.acceptInvitation(token, userId);
  return reply.send({ message: "Invitación aceptada" });
};

const getMiembros = async (
  request: GetMiembrosRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { explotacionId } = request.params;

  // Cualquiera con acceso de consulta puede ver la lista de
  // colaboradores (transparencia sobre quién más tiene acceso).
  await ExplotacionAccessService.checkAccess(
    userId,
    explotacionId,
    NivelAcceso.CONSULTA,
  );

  const miembros = await ExplotacionInvitationService.getMiembros(
    explotacionId,
  );
  return reply.send(miembros);
};

const removeMember = async (
  request: RemoveMemberRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { miembroId } = request.params;

  await ExplotacionInvitationService.removeMember(userId, miembroId);
  return reply.status(204).send();
};

export const ExplotacionInvitationController = {
  create,
  getByToken,
  accept,
  getMiembros,
  removeMember,
};