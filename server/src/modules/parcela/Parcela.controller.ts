import type { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";
import { CatastroService } from "../catastro/Catastro.service.js";
import { ManejoCultivo } from "@agrospace/shared/enums/ManejoCultivo.enum";
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

const verifyExplotacion = async (explotacionId: string, userId: string) => {
  if (!mongoose.isValidObjectId(explotacionId)) {
    throw new ParcelaNotFoundError();
  }
  const explotacion = await ExplotacionModel.findById(explotacionId).lean();
  if (!explotacion) throw new ParcelaNotFoundError();
  if (explotacion.userId.toString() !== userId) {
    throw new ParcelaForbiddenError();
  }
  return explotacion;
};

const getAll = async (request: GetParcelasRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId } = request.params;

  await verifyExplotacion(explotacionId, userId);

  const parcelas = await ParcelaModel.find({ explotacionId, userId })
    .sort({ createdAt: -1 })
    .lean();

  return reply.send(parcelas);
};

const getById = async (request: GetParcelaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId, id } = request.params;

  await verifyExplotacion(explotacionId, userId);

  if (!mongoose.isValidObjectId(id)) throw new ParcelaNotFoundError();

  const parcela = await ParcelaModel.findById(id).lean();
  if (!parcela) throw new ParcelaNotFoundError();
  if (parcela.userId.toString() !== userId) throw new ParcelaForbiddenError();

  return reply.send(parcela);
};

const create = async (request: CreateParcelaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId } = request.params;
  const { nombre, refCatastral, tipoCultivo, variedad, manejo } = request.body;

  const explotacion = await verifyExplotacion(explotacionId, userId);

  await UsageLimitsService.assertCanCreateParcela(userId);

  const existing = await ParcelaModel.findOne({ explotacionId, refCatastral });
  if (existing) throw new ParcelaAlreadyExistsError();

  const catastro = await CatastroService.getParcelByRef({
    ref: refCatastral.trim().slice(0, 14),
  });

  const parcela = await ParcelaModel.create({
    userId,
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

  await verifyExplotacion(explotacionId, userId);

  if (!mongoose.isValidObjectId(id)) throw new ParcelaNotFoundError();

  const parcela = await ParcelaModel.findById(id);
  if (!parcela) throw new ParcelaNotFoundError();
  if (parcela.userId.toString() !== userId) throw new ParcelaForbiddenError();

  Object.assign(parcela, request.body);
  await parcela.save();

  return reply.send(parcela);
};

const remove = async (request: DeleteParcelaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { explotacionId, id } = request.params;

  await verifyExplotacion(explotacionId, userId);

  if (!mongoose.isValidObjectId(id)) throw new ParcelaNotFoundError();

  const parcela = await ParcelaModel.findById(id);
  if (!parcela) throw new ParcelaNotFoundError();
  if (parcela.userId.toString() !== userId) throw new ParcelaForbiddenError();

  await parcela.deleteOne();

  return reply.status(204).send();
};

export const ParcelaController = { getAll, getById, create, update, remove };
