import mongoose from "mongoose";
import { AnalisisModel } from "../../schemas/Analisis.schema.js";
import { CuadernoEntradaModel } from "../../schemas/CuadernoEntrada.schema.js";
import { InsightModel } from "../../schemas/Insight.schema.js";
import { ConversationModel } from "../../schemas/Chatbot.schema.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { ExplotacionMiembroModel } from "../../schemas/ExplotacionMiembro.schema.js";
import { S3Service } from "../S3.service.js";

// Borra todo lo que depende de una parcela antes de borrar la parcela
// en sí. Analisis, CuadernoEntrada e Insight no tienen sentido sin la
// parcela — se borran. Las conversaciones del chatbot sí tienen valor
// propio — solo se desvinculan (parcelaId → null), no se borran.
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

// Borra en cascada TODA una explotación: cada una de sus parcelas
// (con su propia cascada completa), y los colaboradores asociados.
// La explotación en sí NO se borra aquí — eso lo hace el controller,
// una vez que esta función termina de limpiar todo lo que cuelga de
// ella, para mantener la responsabilidad clara de quién borra qué.
const cascadeDeleteExplotacion = async (
  explotacionId: mongoose.Types.ObjectId,
): Promise<void> => {
  const parcelas = await ParcelaModel.find(
    { explotacionId },
    { _id: 1 },
  ).lean();

  // Cascada de cada parcela, en paralelo — cada una limpia sus
  // propios análisis, cuaderno, insights e imágenes en S3.
  await Promise.all(
    parcelas.map((p) => cascadeDeleteParcela(p._id)),
  );

  await Promise.all([
    ParcelaModel.deleteMany({ explotacionId }),
    ExplotacionMiembroModel.deleteMany({ explotacionId }),
  ]);
};

export const CascadeDeleteService = {
  cascadeDeleteParcela,
  cascadeDeleteExplotacion,
};