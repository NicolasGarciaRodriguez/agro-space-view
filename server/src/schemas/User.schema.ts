import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";
import { EmailVerificationStatus } from "@agrospace/shared/enums/EmailVerificationStatus.enum";

// 3 días de plazo desde el registro antes de bloquear el acceso
const VERIFICATION_DEADLINE_DAYS = 3;

export interface IUser {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  role: UserRole;
  plan: UserPlan;
  emailVerificationStatus: EmailVerificationStatus;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  emailVerificationDeadline: Date;
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
    emailVerificationStatus: {
      type: String,
      enum: Object.values(EmailVerificationStatus),
      default: EmailVerificationStatus.PENDIENTE,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    emailVerificationDeadline: {
      type: Date,
      default: () =>
        new Date(Date.now() + VERIFICATION_DEADLINE_DAYS * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  UserSchema,
);