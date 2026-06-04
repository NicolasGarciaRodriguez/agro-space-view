import type { FastifyReply, FastifyRequest } from "fastify";
import mongoose from "mongoose";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";
import {
  ExplotacionNotFoundError,
  ExplotacionForbiddenError,
  type CreateExplotacionRequest,
  type UpdateExplotacionRequest,
  type GetExplotacionRequest,
  type DeleteExplotacionRequest,
} from "./Explotacion.interface.js";


const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  const explotaciones = await ExplotacionModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return reply.send(explotaciones);
};


const getById = async (request: GetExplotacionRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ExplotacionNotFoundError();
  }

  const explotacion = await ExplotacionModel.findById(id).lean();

  if (!explotacion) throw new ExplotacionNotFoundError();
  if (explotacion.userId.toString() !== userId) {
    throw new ExplotacionForbiddenError();
  }

  return reply.send(explotacion);
};


const create = async (
  request: CreateExplotacionRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { nombre, provincia, municipio, descripcion } = request.body;

  const explotacion = await ExplotacionModel.create({
    userId,
    nombre,
    provincia,
    municipio,
    descripcion,
  });

  return reply.status(201).send(explotacion);
};


const update = async (
  request: UpdateExplotacionRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ExplotacionNotFoundError();
  }

  const explotacion = await ExplotacionModel.findById(id);
  if (!explotacion) throw new ExplotacionNotFoundError();
  if (explotacion.userId.toString() !== userId) {
    throw new ExplotacionForbiddenError();
  }

  Object.assign(explotacion, request.body);
  await explotacion.save();

  return reply.send(explotacion);
};


const remove = async (
  request: DeleteExplotacionRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ExplotacionNotFoundError();
  }

  const explotacion = await ExplotacionModel.findById(id);
  if (!explotacion) throw new ExplotacionNotFoundError();
  if (explotacion.userId.toString() !== userId) {
    throw new ExplotacionForbiddenError();
  }

  await explotacion.deleteOne();

  return reply.status(204).send();
};

export const ExplotacionController = {
  getAll,
  getById,
  create,
  update,
  remove,
};
