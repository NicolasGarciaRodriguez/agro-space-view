import type { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { CuadernoEntradaModel } from "../../schemas/CuadernoEntrada.schema.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import {
  EntradaNotFoundError,
  EntradaForbiddenError,
  type CreateEntradaRequest,
  type GetEntradasRequest,
  type UpdateEntradaRequest,
  type DeleteEntradaRequest,
} from "./CuadernoEntrada.interface.js";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { ExplotacionAccessService } from "../../services/explotacionAccess/ExplotacionAccess.service.js";
import {
  ExplotacionAccessDeniedError,
  ExplotacionNotFoundForAccessError,
} from "../../services/explotacionAccess/ExplotacionAccess.interface.js";

const translateAccessError = (error: unknown): never => {
  if (error instanceof ExplotacionNotFoundForAccessError) {
    throw new EntradaNotFoundError();
  }
  if (error instanceof ExplotacionAccessDeniedError) {
    throw new EntradaForbiddenError();
  }
  throw error;
};

// Resuelve la explotación dueña de una parcela — para los casos donde
// solo llega parcelaId, no explotacionId (p. ej. ParcelaCuaderno).
const getExplotacionIdFromParcela = async (
  parcelaId: string,
): Promise<string> => {
  if (!mongoose.isValidObjectId(parcelaId)) throw new EntradaNotFoundError();
  const parcela = await ParcelaModel.findById(parcelaId, {
    explotacionId: 1,
  }).lean();
  if (!parcela) throw new EntradaNotFoundError();
  return parcela.explotacionId.toString();
};

const create = async (request: CreateEntradaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { parcelaId, explotacionId, fecha, tipo, datos, notas } = request.body;

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      explotacionId,
      NivelAcceso.GESTION,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const entrada = await CuadernoEntradaModel.create({
    userId,
    explotacionId,
    parcelaId,
    fecha: new Date(fecha),
    tipo,
    datos,
    notas,
  });

  return reply.status(201).send(entrada);
};

const getAll = async (request: GetEntradasRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const {
    parcelaId,
    explotacionId: explotacionIdQuery,
    tipo,
    limit = 20,
    page = 1,
  } = request.query;

  // Resuelve qué explotación comprobar: si viene directamente, se
  // usa; si no, se resuelve a partir de la parcela.
  const explotacionId = explotacionIdQuery
    ? explotacionIdQuery
    : parcelaId
      ? await getExplotacionIdFromParcela(parcelaId)
      : null;

  if (!explotacionId) {
    // No debería ocurrir en la práctica (siempre se llama con uno de
    // los dos), pero por seguridad no dejamos pasar sin comprobar nada.
    throw new EntradaForbiddenError();
  }

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      explotacionId,
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const filter: Record<string, unknown> = {};
  if (parcelaId) filter.parcelaId = parcelaId;
  if (explotacionIdQuery) filter.explotacionId = explotacionIdQuery;
  if (tipo) filter.tipo = tipo;

  const skip = (page - 1) * limit;

  const [entradas, total] = await Promise.all([
    CuadernoEntradaModel.find(filter)
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CuadernoEntradaModel.countDocuments(filter),
  ]);

  return reply.send({
    entradas,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
};

const update = async (request: UpdateEntradaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) throw new EntradaNotFoundError();

  const entrada = await CuadernoEntradaModel.findById(id);
  if (!entrada) throw new EntradaNotFoundError();

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      entrada.explotacionId.toString(),
      NivelAcceso.GESTION,
    );
  } catch (error) {
    translateAccessError(error);
  }

  if (request.body.fecha) {
    entrada.fecha = new Date(request.body.fecha);
  }
  if (request.body.datos) {
    Object.assign(entrada.datos, request.body.datos);
  }
  if (request.body.notas !== undefined) {
    entrada.notas = request.body.notas;
  }

  await entrada.save();
  return reply.send(entrada);
};

const remove = async (request: DeleteEntradaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) throw new EntradaNotFoundError();

  const entrada = await CuadernoEntradaModel.findById(id);
  if (!entrada) throw new EntradaNotFoundError();

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      entrada.explotacionId.toString(),
      NivelAcceso.GESTION,
    );
  } catch (error) {
    translateAccessError(error);
  }

  await entrada.deleteOne();
  return reply.status(204).send();
};

export const CuadernoEntradaController = {
  create,
  getAll,
  update,
  remove,
};