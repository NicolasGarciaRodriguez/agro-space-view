import mongoose from "mongoose";
import { ExplotacionModel } from "../../schemas/Explotacion.schema.js";
import { ExplotacionMiembroModel } from "../../schemas/ExplotacionMiembro.schema.js";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { ExplotacionAccessRole } from "@agrospace/shared/enums/ExplotacionAccessRole.enum";
import { NIVEL_RANK } from "./ExplotacionAccess.config.js";
import { mapNivelAccesoToRole } from "../../mappers/NivelAccesoToRole.mapper.js";
import {
  ExplotacionAccessDeniedError,
  ExplotacionNotFoundForAccessError,
  type AccessResult,
} from "./ExplotacionAccess.interface.js";

const checkAccess = async (
  userId: string,
  explotacionId: string,
  nivelMinimo: NivelAcceso,
): Promise<AccessResult> => {
  if (!mongoose.isValidObjectId(explotacionId)) {
    throw new ExplotacionNotFoundForAccessError();
  }

  const explotacion = await ExplotacionModel.findById(explotacionId).lean();
  if (!explotacion) throw new ExplotacionNotFoundForAccessError();

  if (explotacion.userId.toString() === userId) {
    return { isOwner: true, nivelAcceso: ExplotacionAccessRole.OWNER };
  }

  const miembro = await ExplotacionMiembroModel.findOne({
    explotacionId,
    userId,
  }).lean();

  if (!miembro) throw new ExplotacionAccessDeniedError();

  const tieneNivelSuficiente =
    NIVEL_RANK[miembro.nivelAcceso] >= NIVEL_RANK[nivelMinimo];

  if (!tieneNivelSuficiente) throw new ExplotacionAccessDeniedError();

  return {
    isOwner: false,
    nivelAcceso: mapNivelAccesoToRole(miembro.nivelAcceso),
  };
};

const getAccessibleExplotacionIds = async (
  userId: string,
): Promise<{
  propias: mongoose.Types.ObjectId[];
  compartidas: mongoose.Types.ObjectId[];
}> => {
  const propias = await ExplotacionModel.find({ userId }, { _id: 1 }).lean();
  const compartidas = await ExplotacionMiembroModel.find(
    { userId },
    { explotacionId: 1 },
  ).lean();

  return {
    propias: propias.map((p) => p._id),
    compartidas: compartidas.map((c) => c.explotacionId),
  };
};

export const ExplotacionAccessService = {
  checkAccess,
  getAccessibleExplotacionIds,
};