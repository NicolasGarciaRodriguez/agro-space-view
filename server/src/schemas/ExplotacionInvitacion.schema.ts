import mongoose, { Schema, Document, Model } from "mongoose";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";
import { InvitacionEstado } from "@agrospace/shared/enums/InvitacionEstado.enum";

export interface IExplotacionInvitacion {
  explotacionIds: mongoose.Types.ObjectId[];
  invitadoPor: mongoose.Types.ObjectId;
  email: string;
  nivelAcceso: NivelAcceso;
  token: string;
  expiresAt: Date;
  estado: InvitacionEstado;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExplotacionInvitacionDocument
  extends IExplotacionInvitacion,
    Document {}

const ExplotacionInvitacionSchema = new Schema<IExplotacionInvitacionDocument>(
  {
    explotacionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Explotacion",
        required: true,
      },
    ],
    invitadoPor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    nivelAcceso: {
      type: String,
      enum: Object.values(NivelAcceso),
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    estado: {
      type: String,
      enum: Object.values(InvitacionEstado),
      default: InvitacionEstado.PENDIENTE,
    },
  },
  { timestamps: true, versionKey: false },
);

export const ExplotacionInvitacionModel: Model<IExplotacionInvitacionDocument> =
  mongoose.model<IExplotacionInvitacionDocument>(
    "ExplotacionInvitacion",
    ExplotacionInvitacionSchema,
  );