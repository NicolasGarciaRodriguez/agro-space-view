import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExplotacionState } from "./Explotacion.types";

export const useExplotacionStore = create<ExplotacionState>()(
  persist(
    (set) => ({
      explotaciones: [],
      activeExplotacion: null,

      setExplotaciones: (explotaciones) => set({ explotaciones }),

      setActiveExplotacion: (explotacion) =>
        set({ activeExplotacion: explotacion }),

      addExplotacion: (explotacion) =>
        set((state) => ({
          explotaciones: [explotacion, ...state.explotaciones],
          activeExplotacion:
            state.explotaciones.length === 0
              ? explotacion
              : state.activeExplotacion,
        })),

      updateExplotacion: (explotacion) =>
        set((state) => ({
          explotaciones: state.explotaciones.map((e) =>
            e._id === explotacion._id ? explotacion : e,
          ),
          activeExplotacion:
            state.activeExplotacion?._id === explotacion._id
              ? explotacion
              : state.activeExplotacion,
        })),

      removeExplotacion: (id) =>
        set((state) => {
          const filtered = state.explotaciones.filter((e) => e._id !== id);
          return {
            explotaciones: filtered,
            activeExplotacion:
              state.activeExplotacion?._id === id
                ? (filtered[0] ?? null)
                : state.activeExplotacion,
          };
        }),

      clearExplotaciones: () =>
        set({ explotaciones: [], activeExplotacion: null }),
    }),
    {
      name: "agrospaceview-explotacion",
      partialize: (state) => ({
        explotaciones: state.explotaciones,
        activeExplotacion: state.activeExplotacion,
      }),
    },
  ),
);
