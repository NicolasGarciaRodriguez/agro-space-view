import type { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { AnalisisNdviModel } from "../../schemas/AnalisisNdvi.schema.js";
import { S3Service } from "../../services/S3.service.js";
import {
  AnalisisNdviNotFoundError,
  type CreateAnalisisNdviRequest,
  type GetAnalisisNdviRequest,
  type DeleteAnalisisNdviRequest,
} from "./AnalisisNdvi.interface.js";


const create = async (
  request: CreateAnalisisNdviRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const {
    parcelaId,
    explotacionId,
    dateFrom,
    dateTo,
    ndviMedio,
    cloudCover,
    usedImageId,
    usedImageDate,
    imageBase64,
    clima,
    timeSeries,
  } = request.body;

  const imageBuffer = Buffer.from(imageBase64, "base64");
  const key = S3Service.generateNdviKey(parcelaId, dateFrom, dateTo);
  const { url: imageUrl } = await S3Service.uploadBuffer(imageBuffer, key);

  const analisis = await AnalisisNdviModel.create({
    userId,
    explotacionId,
    parcelaId,
    dateFrom,
    dateTo,
    ndviMedio,
    cloudCover,
    usedImageId,
    usedImageDate,
    imageUrl,
    clima,
    timeSeries,
  });

  return reply.status(201).send(analisis);
};


const getByParcela = async (
  request: GetAnalisisNdviRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { parcelaId, limit = 10 } = request.query;

  const analisis = await AnalisisNdviModel.find({ parcelaId, userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return reply.send(analisis);
};


const remove = async (
  request: DeleteAnalisisNdviRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AnalisisNdviNotFoundError();
  }

  const analisis = await AnalisisNdviModel.findById(id);
  if (!analisis) throw new AnalisisNdviNotFoundError();
  if (analisis.userId.toString() !== userId) {
    throw new AnalisisNdviNotFoundError();
  }

  await analisis.deleteOne();
  return reply.status(204).send();
};

export const AnalisisNdviController = { create, getByParcela, remove };
