import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExplotacion {
  userId: mongoose.Types.ObjectId;
  nombre: string;
  provincia: string;
  municipio: string;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExplotacionDocument extends IExplotacion, Document {}

const ExplotacionSchema = new Schema<IExplotacionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    provincia: {
      type: String,
      required: true,
      trim: true,
    },
    municipio: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const ExplotacionModel: Model<IExplotacionDocument> =
  mongoose.model<IExplotacionDocument>("Explotacion", ExplotacionSchema);
