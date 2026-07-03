import mongoose, { Schema, Document, Model } from "mongoose";
import { EntradaTipo } from "@agrospace/shared/enums/EntradaTipo.enum";

export interface IEntradaDatos {
  litrosPorM2?: number;
  horas?: number;
  metodo?: string;

  producto?: string;
  dosis?: number;
  unidad?: string;

  motivoTratamiento?: string;
  plaga?: string;

  kg?: number;
  calidad?: string;
  destino?: string;

  texto?: string;
}

export interface ICuadernoEntrada {
  userId: mongoose.Types.ObjectId;
  explotacionId: mongoose.Types.ObjectId;
  parcelaId: mongoose.Types.ObjectId;
  fecha: Date;
  tipo: EntradaTipo;
  datos: IEntradaDatos;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICuadernoEntradaDocument extends ICuadernoEntrada, Document {}

const EntradaDatosSchema = new Schema<IEntradaDatos>(
  {
    litrosPorM2: Number,
    horas: Number,
    metodo: String,
    producto: String,
    dosis: Number,
    unidad: String,
    motivoTratamiento: String,
    plaga: String,
    kg: Number,
    calidad: String,
    destino: String,
    texto: String,
  },
  { _id: false },
);

const CuadernoEntradaSchema = new Schema<ICuadernoEntradaDocument>(
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
    fecha: { type: Date, required: true },
    tipo: {
      type: String,
      enum: Object.values(EntradaTipo),
      required: true,
    },
    datos: { type: EntradaDatosSchema, required: true },
    notas: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false },
);

export const CuadernoEntradaModel: Model<ICuadernoEntradaDocument> =
  mongoose.model<ICuadernoEntradaDocument>(
    "CuadernoEntrada",
    CuadernoEntradaSchema,
  );
