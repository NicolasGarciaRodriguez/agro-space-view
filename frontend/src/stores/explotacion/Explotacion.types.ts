import type { ExplotacionDTO } from "@agrospace/shared/dtos/Explotacion.dto";

export interface ExplotacionState {
  explotaciones: ExplotacionDTO[];
  activeExplotacion: ExplotacionDTO | null;
  setExplotaciones: (explotaciones: ExplotacionDTO[]) => void;
  setActiveExplotacion: (explotacion: ExplotacionDTO) => void;
  addExplotacion: (explotacion: ExplotacionDTO) => void;
  updateExplotacion: (explotacion: ExplotacionDTO) => void;
  removeExplotacion: (id: string) => void;
  clearExplotaciones: () => void;
}
