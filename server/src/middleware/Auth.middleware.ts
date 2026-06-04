import type { FastifyRequest, FastifyReply } from "fastify";

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ error: "No autorizado" });
  }
};
