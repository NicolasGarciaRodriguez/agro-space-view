import mongoose, { Schema, Document, Model } from "mongoose";
import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
export interface IClima {
  tempMaxAvg: number;
  tempMinAvg: number;
  totalPrecipitation: number;
  rainyDays: number;
}

export interface ITimeSeriesPoint {
  date: string;
  mean: number;
  min: number;
  max: number;
}

export interface IAnalisis {
  userId: mongoose.Types.ObjectId;
  explotacionId: mongoose.Types.ObjectId;
  parcelaId: mongoose.Types.ObjectId;
  tipo: IndiceTipo; // ← nuevo: ndvi | ndwi | ndre
  dateFrom: string;
  dateTo: string;
  indiceMedio: number; // ← antes ndviMedio, ahora genérico
  cloudCover: number;
  usedImageId: string;
  usedImageDate: string;
  imageUrl: string;
  clima: IClima;
  timeSeries: ITimeSeriesPoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalisisDocument extends IAnalisis, Document {}

const ClimaSchema = new Schema<IClima>(
  {
    tempMaxAvg: { type: Number, required: true },
    tempMinAvg: { type: Number, required: true },
    totalPrecipitation: { type: Number, required: true },
    rainyDays: { type: Number, required: true },
  },
  { _id: false },
);

const TimeSeriesPointSchema = new Schema<ITimeSeriesPoint>(
  {
    date: { type: String, required: true },
    mean: { type: Number, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  { _id: false },
);

const AnalisisSchema = new Schema<IAnalisisDocument>(
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
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: Object.values(IndiceTipo),
      required: true,
      index: true,
    },    dateFrom: { type: String, required: true },
    dateTo: { type: String, required: true },
    indiceMedio: { type: Number, required: true },
    cloudCover: { type: Number, required: true },
    usedImageId: { type: String, default: "" },
    usedImageDate: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    clima: { type: ClimaSchema, required: true },
    timeSeries: { type: [TimeSeriesPointSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

// Índice compuesto: consultar el último análisis de un tipo por parcela
// es la query más frecuente (histórico, insights). Lo optimizamos.
AnalisisSchema.index({ parcelaId: 1, tipo: 1, createdAt: -1 });

export const AnalisisModel: Model<IAnalisisDocument> =
  mongoose.model<IAnalisisDocument>("Analisis", AnalisisSchema);
