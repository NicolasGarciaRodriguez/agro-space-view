import ExcelJS from "exceljs";
import mongoose from "mongoose";
import { CuadernoEntradaModel } from "../../schemas/CuadernoEntrada.schema.js";
import { ParcelaModel } from "../../schemas/Parcela.schema.js";
import { EntradaTipo } from "@agrospace/shared/enums/EntradaTipo.enum";
import { TIPO_CULTIVO_LABELS } from "@agrospace/shared/config/TipoCultivoLabels.config";
import { ExportForbiddenError } from "./CuadernoExport.interface.js";

// ═══════════════════════════════════════════════════════════════════
//  CONSTRUCCIÓN DE UNA HOJA POR PARCELA
// ═══════════════════════════════════════════════════════════════════

const SECTION_TITLE_STYLE: Partial<ExcelJS.Style> = {
  font: { bold: true, size: 13, color: { argb: "FF2D6A4F" } },
};

const HEADER_STYLE: Partial<ExcelJS.Style> = {
  font: { bold: true, color: { argb: "FFFFFFFF" } },
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2D6A4F" } },
  alignment: { vertical: "middle", horizontal: "left" },
};

interface EntradaRow {
  fecha: Date;
  datos: Record<string, unknown>;
}

// Añade la hoja de una parcela con sus dos secciones (Tratamientos y
// Fertilización) apiladas verticalmente, separadas por un título.
const addParcelaSheet = (
  workbook: ExcelJS.Workbook,
  parcelaNombre: string,
  cultivo: string,
  tratamientos: EntradaRow[],
  fertilizaciones: EntradaRow[],
) => {
  // Excel limita el nombre de hoja a 31 caracteres y no admite ciertos
  // símbolos — sanitizamos para evitar errores al generar el archivo.
  const safeName = parcelaNombre
    .replace(/[\\/*?:[\]]/g, "")
    .slice(0, 31);

  const sheet = workbook.addWorksheet(safeName || "Parcela");

  sheet.columns = [
    { key: "fecha", width: 14 },
    { key: "producto", width: 24 },
    { key: "motivoODosis", width: 22 },
    { key: "plagaOUnidad", width: 22 },
    { key: "dosis", width: 12 },
    { key: "unidad", width: 12 },
  ];

  let rowIndex = 1;

  // Cabecera de la parcela
  sheet.getCell(rowIndex, 1).value = parcelaNombre;
  sheet.getCell(rowIndex, 1).font = { bold: true, size: 15 };
  rowIndex++;
  sheet.getCell(rowIndex, 1).value = `Cultivo: ${cultivo}`;
  sheet.getCell(rowIndex, 1).font = { italic: true, color: { argb: "FF666666" } };
  rowIndex += 2;

  // ─── Sección Tratamientos fitosanitarios ─────────────────────────
  sheet.getCell(rowIndex, 1).value = "Tratamientos fitosanitarios";
  sheet.getCell(rowIndex, 1).style = SECTION_TITLE_STYLE;
  rowIndex++;

  const tratHeaderRow = rowIndex;
  const tratHeaders = ["Fecha", "Producto", "Motivo", "Plaga/enfermedad", "Dosis", "Unidad"];
  tratHeaders.forEach((h, i) => {
    const cell = sheet.getCell(tratHeaderRow, i + 1);
    cell.value = h;
    cell.style = HEADER_STYLE;
  });
  rowIndex++;

  if (tratamientos.length === 0) {
    sheet.getCell(rowIndex, 1).value = "Sin tratamientos registrados en el período.";
    sheet.getCell(rowIndex, 1).font = { italic: true, color: { argb: "FF999999" } };
    rowIndex++;
  } else {
    for (const t of tratamientos) {
      sheet.getRow(rowIndex).values = [
        t.fecha.toLocaleDateString("es-ES"),
        String(t.datos.producto ?? ""),
        String(t.datos.motivoTratamiento ?? ""),
        String(t.datos.plaga ?? ""),
        String(t.datos.dosis ?? ""),
        String(t.datos.unidad ?? ""),
      ] as ExcelJS.CellValue[];
      rowIndex++;
    }
  }

  rowIndex += 2; // espacio entre secciones

  // ─── Sección Fertilización ────────────────────────────────────────
  sheet.getCell(rowIndex, 1).value = "Fertilización";
  sheet.getCell(rowIndex, 1).style = SECTION_TITLE_STYLE;
  rowIndex++;

  const fertHeaderRow = rowIndex;
  const fertHeaders = ["Fecha", "Producto", "Dosis", "Unidad"];
  fertHeaders.forEach((h, i) => {
    const cell = sheet.getCell(fertHeaderRow, i + 1);
    cell.value = h;
    cell.style = HEADER_STYLE;
  });
  rowIndex++;

  if (fertilizaciones.length === 0) {
    sheet.getCell(rowIndex, 1).value = "Sin fertilizaciones registradas en el período.";
    sheet.getCell(rowIndex, 1).font = { italic: true, color: { argb: "FF999999" } };
  } else {
    for (const f of fertilizaciones) {
      sheet.getRow(rowIndex).values = [
        f.fecha.toLocaleDateString("es-ES"),
        String(f.datos.producto ?? ""),
        String(f.datos.dosis ?? ""),
        String(f.datos.unidad ?? ""),
      ] as ExcelJS.CellValue[];
      rowIndex++;
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
//  QUERY COMÚN
// ═══════════════════════════════════════════════════════════════════

const buildDateFilter = (dateFrom?: string, dateTo?: string) => {
  if (!dateFrom && !dateTo) return undefined;
  const filter: Record<string, Date> = {};
  if (dateFrom) filter.$gte = new Date(dateFrom);
  if (dateTo) filter.$lte = new Date(dateTo);
  return filter;
};

// ═══════════════════════════════════════════════════════════════════
//  EXPORTACIÓN POR PARCELA
// ═══════════════════════════════════════════════════════════════════

const exportParcela = async (
  userId: string,
  parcelaId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<{ buffer: Buffer; filename: string }> => {
  if (!mongoose.isValidObjectId(parcelaId)) {
    throw new ExportForbiddenError();
  }

  const parcela = await ParcelaModel.findOne({ _id: parcelaId, userId }).lean();
  if (!parcela) throw new ExportForbiddenError();

  const filter: Record<string, unknown> = {
    parcelaId,
    tipo: { $in: [EntradaTipo.TRATAMIENTO, EntradaTipo.FERTILIZACION] },
  };
  const fechaFilter = buildDateFilter(dateFrom, dateTo);
  if (fechaFilter) filter.fecha = fechaFilter;

  const entradas = await CuadernoEntradaModel.find(filter).sort({ fecha: 1 }).lean();

  const cultivo = parcela.tipoCultivo
    ? TIPO_CULTIVO_LABELS[parcela.tipoCultivo]
    : "Sin especificar";

  const tratamientos = entradas.filter((e) => e.tipo === EntradaTipo.TRATAMIENTO);
  const fertilizaciones = entradas.filter((e) => e.tipo === EntradaTipo.FERTILIZACION);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AgroSpaceView";
  workbook.created = new Date();

  addParcelaSheet(workbook, parcela.nombre, cultivo, tratamientos, fertilizaciones);

  const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  const year = new Date().getFullYear();
  const safeName = parcela.nombre.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `cuaderno_${safeName}_${year}.xlsx`;

  return { buffer, filename };
};

// ═══════════════════════════════════════════════════════════════════
//  EXPORTACIÓN POR EXPLOTACIÓN — una hoja por parcela
// ═══════════════════════════════════════════════════════════════════

const exportExplotacion = async (
  userId: string,
  explotacionId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<{ buffer: Buffer; filename: string }> => {
  if (!mongoose.isValidObjectId(explotacionId)) {
    throw new ExportForbiddenError();
  }

  const parcelas = await ParcelaModel.find({ explotacionId, userId }).lean();
  if (parcelas.length === 0) throw new ExportForbiddenError();

  const parcelaIds = parcelas.map((p) => p._id);

  const filter: Record<string, unknown> = {
    parcelaId: { $in: parcelaIds },
    tipo: { $in: [EntradaTipo.TRATAMIENTO, EntradaTipo.FERTILIZACION] },
  };
  const fechaFilter = buildDateFilter(dateFrom, dateTo);
  if (fechaFilter) filter.fecha = fechaFilter;

  const entradas = await CuadernoEntradaModel.find(filter).sort({ fecha: 1 }).lean();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AgroSpaceView";
  workbook.created = new Date();

  // Una hoja por parcela, en el mismo orden en que se crearon
  for (const parcela of parcelas) {
    const entradasParcela = entradas.filter(
      (e) => e.parcelaId.toString() === parcela._id.toString(),
    );

    const cultivo = parcela.tipoCultivo
      ? TIPO_CULTIVO_LABELS[parcela.tipoCultivo]
      : "Sin especificar";

    const tratamientos = entradasParcela.filter((e) => e.tipo === EntradaTipo.TRATAMIENTO);
    const fertilizaciones = entradasParcela.filter((e) => e.tipo === EntradaTipo.FERTILIZACION);

    addParcelaSheet(workbook, parcela.nombre, cultivo, tratamientos, fertilizaciones);
  }

  const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  const year = new Date().getFullYear();
  const filename = `cuaderno_explotacion_${year}.xlsx`;

  return { buffer, filename };
};

export const CuadernoExportService = { exportParcela, exportExplotacion };