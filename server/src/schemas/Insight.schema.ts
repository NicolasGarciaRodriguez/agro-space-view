import mongoose, { Schema, Document, Model } from "mongoose";
import { InsightTipo } from "@agrospace/shared/enums/InsightTipo.enum";
import { InsightAlertaNivel } from "@agrospace/shared/enums/InsightAlertaNivel.enum";

export interface IInsightContenido {
  resumen: string;
  hallazgos: string[];
  alerta: {
    nivel: InsightAlertaNivel;
    mensaje: string | null;
  };
  recomendacion: string | null;
}

export interface IInsightBasedOn {
  analisisIds: mongoose.Types.ObjectId[];
  cuadernoIds: mongoose.Types.ObjectId[];
}

export interface IInsight {
  userId: mongoose.Types.ObjectId;
  explotacionId: mongoose.Types.ObjectId;
  parcelaId: mongoose.Types.ObjectId | null;
  tipo: InsightTipo;
  contenido: IInsightContenido;
  basedOn: IInsightBasedOn;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInsightDocument extends IInsight, Document {}

const InsightContenidoSchema = new Schema<IInsightContenido>(
  {
    resumen: { type: String, required: true },
    hallazgos: { type: [String], default: [] },
    alerta: {
      nivel: {
        type: String,
        enum: Object.values(InsightAlertaNivel),
        default: InsightAlertaNivel.NINGUNA,
      },
      mensaje: { type: String, default: null },
    },
    recomendacion: { type: String, default: null },
  },
  { _id: false },
);

const InsightSchema = new Schema<IInsightDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    explotacionId: {
      type: Schema.Types.ObjectId,
      ref: "Explotacion",
      required: true,
      index: true,
    },
    parcelaId: {
      type: Schema.Types.ObjectId,
      ref: "Parcela",
      default: null,
      index: true,
    },
    tipo: {
      type: String,
      enum: Object.values(InsightTipo),
      required: true,
    },
    contenido: { type: InsightContenidoSchema, required: true },
    basedOn: {
      analisisIds: [{ type: Schema.Types.ObjectId, ref: "Analisis" }],
      cuadernoIds: [{ type: Schema.Types.ObjectId, ref: "CuadernoEntrada" }],
    },
  },
  { timestamps: true, versionKey: false },
);

InsightSchema.index({ parcelaId: 1, createdAt: -1 });
InsightSchema.index({ explotacionId: 1, tipo: 1, createdAt: -1 });

export const InsightModel: Model<IInsightDocument> =
  mongoose.model<IInsightDocument>("Insight", InsightSchema);
