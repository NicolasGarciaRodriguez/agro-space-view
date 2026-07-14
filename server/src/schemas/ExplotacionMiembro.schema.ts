import mongoose, { Schema, Document, Model } from "mongoose";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";

export interface IExplotacionMiembro {
  explotacionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  nivelAcceso: NivelAcceso;
  invitadoPor: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExplotacionMiembroDocument
  extends IExplotacionMiembro,
    Document {}

const ExplotacionMiembroSchema = new Schema<IExplotacionMiembroDocument>(
  {
    explotacionId: {
      type: Schema.Types.ObjectId,
      ref: "Explotacion",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nivelAcceso: {
      type: String,
      enum: Object.values(NivelAcceso),
      required: true,
    },
    invitadoPor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

ExplotacionMiembroSchema.index(
  { explotacionId: 1, userId: 1 },
  { unique: true },
);

export const ExplotacionMiembroModel: Model<IExplotacionMiembroDocument> =
  mongoose.model<IExplotacionMiembroDocument>(
    "ExplotacionMiembro",
    ExplotacionMiembroSchema,
  );