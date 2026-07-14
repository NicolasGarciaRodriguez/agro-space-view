import type { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";
import { CatastroService } from "../catastro/Catastro.service.js";
import { ManejoCultivo } from "@agrospace/shared/enums/ManejoCultivo.enum";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import {
  ParcelaNotFoundError,
  ParcelaForbiddenError,
  ParcelaAlreadyExistsError,
  type CreateParcelaRequest,
  type GetParcelasRequest,
  type GetParcelaRequest,
  type UpdateParcelaRequest,
  type DeleteParcelaRequest,
} from "./Parcela.interface.js";
import { UsageLimitsService } from "../usageLimits/UsageLimits.service.js";
import {
  ExplotacionAccessDeniedError,
  ExplotacionNotFoundForAccessError,
} from "../../services/explotacionAccess/ExplotacionAccess.interface.js";
import { ExplotacionAccessService } from "../../services/explotacionAccess/ExplotacionAccess.service.js";
import { CascadeDeleteService } from "../../services/cascadeDelete/CascadeDelete.service.js";

const translateAccessError = (error: unknown): never => {
  if (error instanceof ExplotacionNotFoundForAccessError) {
    throw new ParcelaNotFoundError();
  }
  if (error instanceof ExplotacionAccessDeniedError) {
    throw new ParcelaForbiddenError();
  }
  throw error;
};

const verifyExplotacionAccess = async (
  explotacionId: string,
  userId: string,
  nivelMinimo: NivelAcceso,
) => {
  try {
    await ExplotacionAccessService.checkAccess(userId, explotacionId, nivelMinimo);
  } catch (error) {
    translateAccessError(error);
  }

  // Devolvemos la explotación completa porque `create` necesita sus
  // datos (provincia, municipio) para construir la parcela.
  return ExplotacionModel.findById(explotacionId).lean();
};


const getAll = async (request: GetParcelasRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId } = request.params;

  await verifyExplotacionAccess(explotacionId, userId, NivelAcceso.CONSULTA);

  const parcelas = await ParcelaModel.find({ explotacionId })
    .sort({ createdAt: -1 })
    .lean();

  return reply.send(parcelas);
};

const getById = async (request: GetParcelaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId, id } = request.params;

  await verifyExplotacionAccess(explotacionId, userId, NivelAcceso.CONSULTA);

  if (!mongoose.isValidObjectId(id)) throw new ParcelaNotFoundError();

  const parcela = await ParcelaModel.findById(id).lean();
  if (!parcela) throw new ParcelaNotFoundError();
  // Ya no comprobamos parcela.userId — el acceso a la explotación es
  // lo que autoriza, no quién creó la parcela originalmente.

  return reply.send(parcela);
};

const create = async (request: CreateParcelaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId } = request.params;
  const { nombre, refCatastral, tipoCultivo, variedad, manejo } = request.body;

  const explotacion = await verifyExplotacionAccess(
    explotacionId,
    userId,
    NivelAcceso.GESTION,
  );
  if (!explotacion) throw new ParcelaNotFoundError();

  // El límite de plan se aplica siempre al DUEÑO de la explotación,
  // no a quien la gestiona — es su plan el que define cuántas
  // parcelas caben, sin importar quién las cree materialmente.
  await UsageLimitsService.assertCanCreateParcela(explotacion.userId.toString());

  const existing = await ParcelaModel.findOne({ explotacionId, refCatastral });
  if (existing) throw new ParcelaAlreadyExistsError();

  const catastro = await CatastroService.getParcelByRef({
    ref: refCatastral.trim().slice(0, 14),
  });

  const parcela = await ParcelaModel.create({
    userId, // quién la creó materialmente, a efectos de auditoría
    explotacionId,
    nombre,
    refCatastral: catastro.ref,
    tipoCultivo,
    variedad,
    manejo: manejo ?? ManejoCultivo.CONVENCIONAL,
    provincia: explotacion.provincia,
    municipio: explotacion.municipio,
    superficie: catastro.area,
    description: catastro.description,
    center: catastro.center,
    bbox: catastro.bbox,
    polygon: catastro.polygon,
  });

  return reply.status(201).send(parcela);
};

const update = async (request: UpdateParcelaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId, id } = request.params;

  await verifyExplotacionAccess(explotacionId, userId, NivelAcceso.GESTION);

  if (!mongoose.isValidObjectId(id)) throw new ParcelaNotFoundError();

  const parcela = await ParcelaModel.findById(id);
  if (!parcela) throw new ParcelaNotFoundError();

  Object.assign(parcela, request.body);
  await parcela.save();

  return reply.send(parcela);
};

const remove = async (request: DeleteParcelaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId, id } = request.params;

  await verifyExplotacionAccess(explotacionId, userId, NivelAcceso.GESTION);

  if (!mongoose.isValidObjectId(id)) throw new ParcelaNotFoundError();

  const parcela = await ParcelaModel.findById(id);
  if (!parcela) throw new ParcelaNotFoundError();

  await CascadeDeleteService.cascadeDeleteParcela(parcela._id);
  await parcela.deleteOne();

  return reply.status(204).send();
};

export const ParcelaController = { getAll, getById, create, update, remove };