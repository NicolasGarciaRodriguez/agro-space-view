import mongoose, { Schema, Document, Model } from "mongoose";

export type LonLat = [number, number];

export interface IParcela {
  userId: mongoose.Types.ObjectId;
  explotacionId: mongoose.Types.ObjectId;
  nombre: string;
  refCatastral: string;
  cultivo?: string;
  provincia: string;
  municipio: string;
  superficie: number;
  description?: string;
  center: LonLat;
  bbox: [number, number, number, number];
  polygon: LonLat[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IParcelaDocument extends IParcela, Document {}

const ParcelaSchema = new Schema<IParcelaDocument>(
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
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    refCatastral: {
      type: String,
      required: true,
      trim: true,
    },
    cultivo: {
      type: String,
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
    superficie: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    center: {
      type: [Number],
      required: true,
    },
    bbox: {
      type: [Number],
      required: true,
    },
    polygon: {
      type: [[Number]],
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

ParcelaSchema.index({ center: "2dsphere" });

export const ParcelaModel: Model<IParcelaDocument> =
  mongoose.model<IParcelaDocument>("Parcela", ParcelaSchema);
