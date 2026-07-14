import type { FastifyInstance } from "fastify";
import AuthRoutes from "../modules/auth/Auth.routes.js";
import StacRoutes from "../modules/stac/Stac.routes.js";
import CatastroRoutes from "../modules/catastro/Catastro.routes.js";
import WeatherRoutes from "../modules/weather/Weather.routes.js";
import ExplotacionRoutes from "../modules/explotacion/Explotacion.routes.js";
import ParcelaRoutes from "../modules/parcela/Parcela.routes.js";
import CuadernoEntradaRoutes from "../modules/cuadernoEntrada/CuadernoEntrada.routes.js";
import AnalisisRoutes from "../modules/analisis/Analisis.routes.js";
import InsightsRoutes from "../modules/insights/Insights.routes.js";
import ChatbotRoutes from "../modules/chatbot/Chatbot.routes.js";
import CuadernoExportRoutes from "../modules/cuadernoExport/CuadernoExport.routes.js";
import EmailVerificationRoutes from "../modules/emailVerification/EmailVerification.routes.js";
import PasswordResetRoutes from "../modules/passwordReset/PasswordReset.routes.js";
import ExplotacionInvitationRoutes from "../modules/explotacionInvitation/ExplotacionInvitation.routes.js";

export default async function routes(fastify: FastifyInstance) {
  await fastify.register(AuthRoutes);
  await fastify.register(StacRoutes);
  await fastify.register(CatastroRoutes);
  await fastify.register(WeatherRoutes);
  await fastify.register(ExplotacionRoutes);
  await fastify.register(ParcelaRoutes);
  await fastify.register(AnalisisRoutes);
  await fastify.register(CuadernoEntradaRoutes);
  await fastify.register(InsightsRoutes);
  await fastify.register(ChatbotRoutes);
  await fastify.register(CuadernoExportRoutes);
  await fastify.register(EmailVerificationRoutes);
  await fastify.register(PasswordResetRoutes);
  await fastify.register(ExplotacionInvitationRoutes);
}
