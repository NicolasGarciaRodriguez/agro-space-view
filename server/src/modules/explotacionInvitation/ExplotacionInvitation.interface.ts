import type { FastifyRequest } from "fastify";
import { NivelAcceso } from "@agrospace/shared/enums/NivelAcceso.enum";

export interface CreateInvitationBody {
  explotacionIds: string[];
  email: string;
  nivelAcceso: NivelAcceso;
}

export interface AcceptInvitationParams {
  token: string;
}

export interface GetInvitationParams {
  token: string;
}

export interface RemoveMemberParams {
  miembroId: string;
}

export interface GetMiembrosParams {
  explotacionId: string;
}

export type CreateInvitationRequest = FastifyRequest<{
  Body: CreateInvitationBody;
}>;

export type AcceptInvitationRequest = FastifyRequest<{
  Params: AcceptInvitationParams;
}>;

export type GetInvitationRequest = FastifyRequest<{
  Params: GetInvitationParams;
}>;

export type RemoveMemberRequest = FastifyRequest<{
  Params: RemoveMemberParams;
}>;

export type GetMiembrosRequest = FastifyRequest<{
  Params: GetMiembrosParams;
}>;

export class InvitationNotFoundError extends Error {
  constructor() {
    super("Invitación no encontrada");
    this.name = "InvitationNotFoundError";
  }
}

export class InvitationExpiredError extends Error {
  constructor() {
    super("Esta invitación ha caducado");
    this.name = "InvitationExpiredError";
  }
}

export class InvitationEmailMismatchError extends Error {
  constructor() {
    super("Esta invitación fue enviada a otro email");
    this.name = "InvitationEmailMismatchError";
  }
}

export class InvitationForbiddenError extends Error {
  constructor() {
    super("Solo el dueño de la explotación puede invitar colaboradores");
    this.name = "InvitationForbiddenError";
  }
}

export class TooManyPendingInvitationsError extends Error {
  constructor() {
    super(
      "Has alcanzado el límite de invitaciones pendientes para esta explotación",
    );
    this.name = "TooManyPendingInvitationsError";
  }
}

export class MemberNotFoundError extends Error {
  constructor() {
    super("Colaborador no encontrado");
    this.name = "MemberNotFoundError";
  }
}