export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Tu explotación",
    description: "Empieza dando nombre a tu explotación agrícola",
    icon: "🌿",
  },
  {
    id: 2,
    title: "Primera parcela",
    description: "Añade tu primera parcela usando la referencia catastral",
    icon: "🛰",
  },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["id"];
