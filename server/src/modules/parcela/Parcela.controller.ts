import type { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";
import { AnalisisModel } from "../../schemas/Analisis.schema.js";
import { CuadernoEntradaModel } from "../../schemas/CuadernoEntrada.schema.js";
import { InsightModel } from "../../schemas/Insight.schema.js";
import { ConversationModel } from "../../schemas/Chatbot.schema.js";
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
import { S3Service } from "../../services/S3.service.js";

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


const cascadeDeleteParcela = async (
  parcelaId: mongoose.Types.ObjectId,
): Promise<void> => {
  const analisis = await AnalisisModel.find({ parcelaId }, { imageUrl: 1 }).lean();
  const s3Keys = analisis
    .map((a) => S3Service.keyFromUrl(a.imageUrl))
    .filter((key): key is string => key !== null);

  await Promise.all([
    AnalisisModel.deleteMany({ parcelaId }),
    CuadernoEntradaModel.deleteMany({ parcelaId }),
    InsightModel.deleteMany({ parcelaId }),
    ConversationModel.updateMany({ parcelaId }, { $set: { parcelaId: null } }),
  ]);

  try {
    await S3Service.deleteObjects(s3Keys);
  } catch (error) {
    console.error(`⚠️ Error borrando ${s3Keys.length} imágenes de S3:`, error);
  }
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

  await cascadeDeleteParcela(parcela._id);
  await parcela.deleteOne();

  return reply.status(204).send();
};

export const ParcelaController = { getAll, getById, create, update, remove };