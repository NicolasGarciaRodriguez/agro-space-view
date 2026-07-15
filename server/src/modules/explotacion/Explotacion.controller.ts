import type { FastifyReply, FastifyRequest } from "fastify";
import mongoose from "mongoose";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";
import { ExplotacionMiembroModel } from "../../schemas/ExplotacionMiembro.schema.js";
import {
  ExplotacionNotFoundError,
  ExplotacionForbiddenError,
  type CreateExplotacionRequest,
  type UpdateExplotacionRequest,
  type GetExplotacionRequest,
  type DeleteExplotacionRequest,
  GetExplotacionStatsRequest,
} from "./Explotacion.interface.js";
import { AnalisisModel } from "../../schemas/Analisis.schema.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import { NDVI_ALERT_THRESHOLD } from "./Explotacion.config.js";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { ExplotacionAccessRole } from "@agrospace/shared/enums/ExplotacionAccessRole.enum";
import { UsageLimitsService } from "../usageLimits/UsageLimits.service.js";
import { mapNivelAccesoToRole } from "../../mappers/NivelAccesoToRole.mapper.js";
import {
  ExplotacionAccessService,
} from "../../services/explotacionAccess/ExplotacionAccess.service.js";
import {
  ExplotacionAccessDeniedError,
  ExplotacionNotFoundForAccessError,
} from "../../services/explotacionAccess/ExplotacionAccess.interface.js";
import { CascadeDeleteService } from "../../services/cascadeDelete/CascadeDelete.service.js";

const translateAccessError = (error: unknown): never => {
  if (error instanceof ExplotacionNotFoundForAccessError) {
    throw new ExplotacionNotFoundError();
  }
  if (error instanceof ExplotacionAccessDeniedError) {
    throw new ExplotacionForbiddenError();
  }
  throw error;
};

const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  const propias = await ExplotacionModel.find({ userId }).lean();

  const miembros = await ExplotacionMiembroModel.find({ userId }).lean();
  const nivelPorExplotacion = new Map(
    miembros.map((m) => [m.explotacionId.toString(), m.nivelAcceso]),
  );
  const explotacionIdsCompartidas = miembros.map((m) => m.explotacionId);

  const compartidas = explotacionIdsCompartidas.length
    ? await ExplotacionModel.find({
        _id: { $in: explotacionIdsCompartidas },
      }).lean()
    : [];

  // Cada explotación se enriquece con el nivel de acceso del usuario
  // actual sobre ella — "owner" para las propias, el nivel concreto
  // (traducido con el mapper) para las compartidas.
  const propiasConNivel = propias.map((e) => ({
    ...e,
    nivelAcceso: ExplotacionAccessRole.OWNER,
  }));

  const compartidasConNivel = compartidas.map((e) => ({
    ...e,
    nivelAcceso: mapNivelAccesoToRole(
      nivelPorExplotacion.get(e._id.toString())!,
    ),
  }));

  const explotaciones = [...propiasConNivel, ...compartidasConNivel].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return reply.send(explotaciones);
};

const getById = async (request: GetExplotacionRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { id } = request.params;

  let accessResult;
  try {
    accessResult = await ExplotacionAccessService.checkAccess(
      userId,
      id,
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const explotacion = await ExplotacionModel.findById(id).lean();
  return reply.send({ ...explotacion, nivelAcceso: accessResult!.nivelAcceso });
};

const create = async (
  request: CreateExplotacionRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { nombre, provincia, municipio, descripcion } = request.body;

  await UsageLimitsService.assertCanCreateExplotacion(userId);

  const explotacion = await ExplotacionModel.create({
    userId,
    nombre,
    provincia,
    municipio,
    descripcion,
  });

  return reply.status(201).send({
    ...explotacion.toObject(),
    nivelAcceso: ExplotacionAccessRole.OWNER,
  });
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

  await CascadeDeleteService.cascadeDeleteExplotacion(explotacion._id);
  await explotacion.deleteOne();

  return reply.status(204).send();
};

const getStats = async (
  request: GetExplotacionStatsRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id: explotacionId } = request.params;

  try {
    await ExplotacionAccessService.checkAccess(
      userId,
      explotacionId,
      NivelAcceso.CONSULTA,
    );
  } catch (error) {
    translateAccessError(error);
  }

  const parcelas = await ParcelaModel.find({ explotacionId }).lean();
  const parcelaIds = parcelas.map((p) => p._id);

  const ultimosAnalisis = await AnalisisModel.aggregate([
    {
      $match: {
        parcelaId: { $in: parcelaIds },
        tipo: IndiceTipo.NDVI,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$parcelaId",
        indiceMedio: { $first: "$indiceMedio" },
        createdAt: { $first: "$createdAt" },
        dateFrom: { $first: "$dateFrom" },
        dateTo: { $first: "$dateTo" },
      },
    },
  ]);

  const analisisSorted = [...ultimosAnalisis].sort(
    (a, b) => b.indiceMedio - a.indiceMedio,
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

  const parcelasEnBuenEstado = ultimosAnalisis.filter(
    (a) => a.indiceMedio >= NDVI_ALERT_THRESHOLD,
  ).length;

  return reply.send({
    totalParcelas: parcelas.length,
    parcelasAnalizadas: ultimosAnalisis.length,
    parcelasEnBuenEstado,
    ultimoAnalisis: ultimoAnalisis?.createdAt ?? null,
    diasSinAnalizar,
    parcelaMejor: mejor
      ? {
          nombre: parcelaMap[mejor._id.toString()]?.nombre ?? "",
          ndvi: mejor.indiceMedio,
        }
      : null,
    parcelaPeor:
      peor && peor.indiceMedio < NDVI_ALERT_THRESHOLD
        ? {
            nombre: parcelaMap[peor._id.toString()]?.nombre ?? "",
            ndvi: peor.indiceMedio,
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