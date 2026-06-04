import type { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { CuadernoEntradaModel } from "../../schemas/CuadernoEntrada.schema.js";
import {
  EntradaNotFoundError,
  EntradaForbiddenError,
  type CreateEntradaRequest,
  type GetEntradasRequest,
  type UpdateEntradaRequest,
  type DeleteEntradaRequest,
} from "./CuadernoEntrada.interface.js";


const create = async (request: CreateEntradaRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { parcelaId, explotacionId, fecha, tipo, datos, notas } = request.body;

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
    explotacionId,
    tipo,
    limit = 20,
    page = 1,
  } = request.query;

  const filter: Record<string, unknown> = { userId };
  if (parcelaId) filter.parcelaId = parcelaId;
  if (explotacionId) filter.explotacionId = explotacionId;
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
  if (entrada.userId.toString() !== userId) throw new EntradaForbiddenError();

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
  if (entrada.userId.toString() !== userId) throw new EntradaForbiddenError();

  await entrada.deleteOne();
  return reply.status(204).send();
};

export const CuadernoEntradaController = {
  create,
  getAll,
  update,
  remove,
};
