import { IndiceTipo } from "@agrospace/shared/enums/IndiceTipo.enum";
import { type IndiceDefinition } from "../Analisis.config.js";

export const NDWI: IndiceDefinition = {
  tipo: IndiceTipo.NDWI,
  label: "NDWI",
  descripcion: "Contenido de agua y estrés hídrico",
  bands: ["B03", "B08"],
  imageEvalscript: `
//VERSION=3
function setup() {
  return { input: ["B03", "B08", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  const v = (s.B03 - s.B08) / (s.B03 + s.B08);
  if (s.dataMask === 0) return [0, 0, 0, 0];
  if (v < -0.3) return [0.8, 0.5, 0.2, 1];
  if (v < -0.1) return [0.9, 0.8, 0.4, 1];
  if (v < 0.1)  return [0.6, 0.8, 0.9, 1];
  if (v < 0.3)  return [0.2, 0.5, 0.9, 1];
  return             [0.1, 0.2, 0.8, 1];
}`,
  statisticsEvalscript: `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B08", "dataMask"] }],
    output: [{ id: "index", bands: 1 }, { id: "dataMask", bands: 1 }]
  };
}
function evaluatePixel(s) {
  return {
    index: [(s.B03 - s.B08) / (s.B03 + s.B08)],
    dataMask: [s.dataMask]
  };
}`,
  ranges: [
    { min: -1, max: -0.3, label: "Muy seco", color: "#cc8033" },
    { min: -0.3, max: -0.1, label: "Seco", color: "#e6cc66" },
    { min: -0.1, max: 0.1, label: "Húmedo moderado", color: "#99cce6" },
    { min: 0.1, max: 0.3, label: "Húmedo", color: "#3380e6" },
    { min: 0.3, max: 1, label: "Muy húmedo/agua", color: "#1a33cc" },
  ],
};
