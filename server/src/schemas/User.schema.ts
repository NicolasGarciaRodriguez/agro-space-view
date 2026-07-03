import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";

export interface IUser {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  role: UserRole;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    nombre: { type: String, required: true, trim: true },
    apellidos: { type: String, required: true, trim: true },
    telefono: { type: String, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USUARIO,
    },
    plan: {
      type: String,
      enum: Object.values(UserPlan),
      default: UserPlan.GRATIS,
    },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  UserSchema,
);
