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
  GetExplotacionStatsRequest,
} from "./Explotacion.interface.js";
import { AnalisisNdviModel } from "../../schemas/AnalisisNdvi.schema.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { NDVI_ALERT_THRESHOLD } from "./Explotacion.config.js";

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

const getStats = async (
  request: GetExplotacionStatsRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id: explotacionId } = request.params;

  if (!mongoose.isValidObjectId(explotacionId)) {
    throw new ExplotacionNotFoundError();
  }

  const explotacion = await ExplotacionModel.findById(explotacionId).lean();
  if (!explotacion) throw new ExplotacionNotFoundError();
  if (explotacion.userId.toString() !== userId) {
    throw new ExplotacionForbiddenError();
  }

  const parcelas = await ParcelaModel.find({ explotacionId, userId }).lean();

  const parcelaIds = parcelas.map((p) => p._id);

  const ultimosAnalisis = await AnalisisNdviModel.aggregate([
    {
      $match: {
        parcelaId: { $in: parcelaIds },
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$parcelaId",
        ndviMedio: { $first: "$ndviMedio" },
        createdAt: { $first: "$createdAt" },
        dateFrom: { $first: "$dateFrom" },
        dateTo: { $first: "$dateTo" },
      },
    },
  ]);

  // Parcela con mejor y peor NDVI
  const analisisSorted = [...ultimosAnalisis].sort(
    (a, b) => b.ndviMedio - a.ndviMedio,
  );

  const parcelaMap = Object.fromEntries(
    parcelas.map((p) => [p._id.toString(), p]),
  );

  const mejor = analisisSorted[0];
  const peor = analisisSorted[analisisSorted.length - 1];

  const ultimoAnalisis = ultimosAnalisis.reduce(
    (latest, a) => (!latest || a.createdAt > latest.createdAt ? a : latest),
    null as (typeof ultimosAnalisis)[0] | null,
  );

  const diasSinAnalizar = ultimoAnalisis
    ? Math.floor(
        (Date.now() - new Date(ultimoAnalisis.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const ndviMedio =
    ultimosAnalisis.length > 0
      ? Math.round(
          (ultimosAnalisis.reduce((a, b) => a + b.ndviMedio, 0) /
            ultimosAnalisis.length) *
            1000,
        ) / 1000
      : null;

  return reply.send({
    totalParcelas: parcelas.length,
    parcelasAnalizadas: ultimosAnalisis.length,
    ndviMedio,
    ultimoAnalisis: ultimoAnalisis?.createdAt ?? null,
    diasSinAnalizar,
    parcelaMejor: mejor
      ? {
          nombre: parcelaMap[mejor._id.toString()]?.nombre ?? "",
          ndvi: mejor.ndviMedio,
        }
      : null,
    parcelaPeor:
      peor && peor.ndviMedio < NDVI_ALERT_THRESHOLD
        ? {
            nombre: parcelaMap[peor._id.toString()]?.nombre ?? "",
            ndvi: peor.ndviMedio,
          }
        : null,
  });
};

export const ExplotacionController = {
  getAll,
  getById,
  create,
  update,
  remove,
  getStats,
};
