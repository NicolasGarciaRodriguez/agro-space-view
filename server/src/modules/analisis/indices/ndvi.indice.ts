import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import { type IndiceDefinition } from "../Analisis.config.js";

export const NDVI: IndiceDefinition = {
  tipo: IndiceTipo.NDVI,
  label: "NDVI",
  descripcion: "Vigor y densidad de la vegetación",
  bands: ["B04", "B08"],
  imageEvalscript: `
//VERSION=3
function setup() {
  return { input: ["B04", "B08", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  const v = (s.B08 - s.B04) / (s.B08 + s.B04);
  if (s.dataMask === 0) return [0, 0, 0, 0];
  if (v < 0)   return [0.5, 0.5, 0.5, 1];
  if (v < 0.2) return [0.9, 0.2, 0.2, 1];
  if (v < 0.4) return [0.9, 0.7, 0.1, 1];
  if (v < 0.6) return [0.6, 0.9, 0.1, 1];
  return            [0.1, 0.6, 0.1, 1];
}`,
  statisticsEvalscript: `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [{ id: "index", bands: 1 }, { id: "dataMask", bands: 1 }]
  };
}
function evaluatePixel(s) {
  return {
    index: [(s.B08 - s.B04) / (s.B08 + s.B04)],
    dataMask: [s.dataMask]
  };
}`,
  ranges: [
    { min: -1, max: 0, label: "Agua / suelo desnudo", color: "#808080" },
    { min: 0, max: 0.2, label: "Estrés severo", color: "#e63333" },
    { min: 0.2, max: 0.4, label: "Vegetación escasa", color: "#e6b31a" },
    { min: 0.4, max: 0.6, label: "Vegetación moderada", color: "#99e61a" },
    { min: 0.6, max: 1, label: "Vegetación sana", color: "#1a991a" },
  ],
};
