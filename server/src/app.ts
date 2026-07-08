import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";
import { connectDatabase } from "./db/connection.js";
import { ErrorHandler } from "./errors/Error.handler.js";
import routes from "./routes/index.js";

export async function buildApp() {
  await connectDatabase();

  const app = Fastify({ logger: true });

  app.setErrorHandler(ErrorHandler);

  const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || corsOrigins.includes(origin.replace(/\/$/, ""))) {
        cb(null, true);
        return;
      }
      cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposedHeaders: [
      "X-Analisis-Tipo",
      "X-Analisis-Image-Id",
      "X-Analisis-Image-Date",
      "X-Analisis-Cloud-Cover",
      "Content-Disposition",
    ],
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET,
  });

  await app.register(routes);

  app.get("/", async () => ({ message: "AgroSpaceView API" }));
  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
