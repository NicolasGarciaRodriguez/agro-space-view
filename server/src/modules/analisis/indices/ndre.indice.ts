import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import type { IndiceDefinition } from "../Analisis.config.js";

export const NDRE: IndiceDefinition = {
  tipo: IndiceTipo.NDRE,
  label: "NDRE",
  descripcion: "Clorofila y estado nutricional (nitrógeno)",
  bands: ["B05", "B08"],
  imageEvalscript: `
//VERSION=3
function setup() {
  return { input: ["B05", "B08", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  const v = (s.B08 - s.B05) / (s.B08 + s.B05);
  if (s.dataMask === 0) return [0, 0, 0, 0];
  if (v < 0.1) return [0.9, 0.3, 0.2, 1];
  if (v < 0.2) return [0.9, 0.6, 0.2, 1];
  if (v < 0.3) return [0.9, 0.9, 0.3, 1];
  if (v < 0.4) return [0.6, 0.9, 0.3, 1];
  return            [0.2, 0.7, 0.2, 1];
}`,
  statisticsEvalscript: `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B05", "B08", "dataMask"] }],
    output: [{ id: "index", bands: 1 }, { id: "dataMask", bands: 1 }]
  };
}
function evaluatePixel(s) {
  return {
    index: [(s.B08 - s.B05) / (s.B08 + s.B05)],
    dataMask: [s.dataMask]
  };
}`,
  ranges: [
    { min: -1, max: 0.1, label: "Déficit nutricional", color: "#e64d33" },
    { min: 0.1, max: 0.2, label: "Bajo", color: "#e69933" },
    { min: 0.2, max: 0.3, label: "Moderado", color: "#e6e64d" },
    { min: 0.3, max: 0.4, label: "Bueno", color: "#99e64d" },
    { min: 0.4, max: 1, label: "Óptimo", color: "#33b333" },
  ],
};
