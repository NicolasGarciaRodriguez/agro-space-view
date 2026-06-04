import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400, "BAD_REQUEST");
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

function isMongoDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

export const ErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof AppError) {
    void reply.code(error.statusCode).send({
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
    });
    return;
  }

  if (isMongoDuplicateKey(error)) {
    void reply.code(400).send({
      message: "duplicate key",
      code: "DUPLICATE_ENTRY",
    });
    return;
  }

  if (error.validation) {
    void reply.status(400).send({
      message: error.message,
      code: "VALIDATION_ERROR",
    });
    return;
  }

  request.log.error(error);
  void reply.code(500).send({ message: "Internal Server Error" });
};
