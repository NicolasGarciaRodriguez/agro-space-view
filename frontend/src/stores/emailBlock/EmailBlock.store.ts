import { create } from "zustand";

interface EmailBlockState {
  isBlocked: boolean;
  setBlocked: () => void;
  clearBlocked: () => void;
}

export const useEmailBlockStore = create<EmailBlockState>((set) => ({
  isBlocked: false,
  setBlocked: () => set({ isBlocked: true }),
  clearBlocked: () => set({ isBlocked: false }),
}));