import type { FastifyReply } from "fastify";
import { CuadernoExportService } from "./CuadernoExport.service.js";
import type {
  ExportParcelaRequest,
  ExportExplotacionRequest,
} from "./CuadernoExport.interface.js";

const exportParcela = async (
  request: ExportParcelaRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { parcelaId } = request.params;
  const { dateFrom, dateTo } = request.query;

  const { buffer, filename } = await CuadernoExportService.exportParcela(
    userId,
    parcelaId,
    dateFrom,
    dateTo,
  );

  reply.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  reply.header("Content-Disposition", `attachment; filename="${filename}"`);

  return reply.send(buffer);
};

const exportExplotacion = async (
  request: ExportExplotacionRequest,
  reply: FastifyReply,
) => {
  const { userId } = request.user;
  const { explotacionId } = request.params;
  const { dateFrom, dateTo } = request.query;

  const { buffer, filename } = await CuadernoExportService.exportExplotacion(
    userId,
    explotacionId,
    dateFrom,
    dateTo,
  );

  reply.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  reply.header("Content-Disposition", `attachment; filename="${filename}"`);

  return reply.send(buffer);
};

export const CuadernoExportController = { exportParcela, exportExplotacion };