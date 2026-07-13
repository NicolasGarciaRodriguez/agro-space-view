export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "gratis",
    name: "Gratis",
    price: "0€",
    period: "para siempre",
    description: "Prueba la plataforma sin compromiso",
    features: [
      "1 parcela",
      "NDVI, NDWI y NDRE — 1 análisis/mes de cada",
      "1 diagnóstico IA visible al mes",
      "1 mensaje al chatbot por semana",
      "Exportación de cuaderno de campo",
    ],
    cta: "Empezar gratis",
  },
  {
    id: "pro",
    name: "Pro",
    price: "24€",
    period: "/mes",
    description: "Para el agricultor que quiere monitoreo real",
    features: [
      "Parcelas ilimitadas",
      "NDVI, NDWI y NDRE sin límite",
      "Diagnóstico IA automático en cada análisis",
      "Chatbot — 50 mensajes al día",
      "Exportación de cuaderno de campo",
    ],
    cta: "Empezar con Pro",
    highlighted: true,
  },
  {
    id: "tecnico",
    name: "Técnico",
    price: "69€",
    period: "/mes",
    description: "Para asesores ROPO y gestión multi-explotación",
    features: [
      "Todo lo de Pro",
      "Gestión de varias explotaciones",
      "Chatbot — 150 mensajes al día",
      "Prioridad de soporte",
    ],
    cta: "Empezar con Técnico",
  },
];

export const PRICING_NOTE =
  "Precios de lanzamiento. Sin permanencia — cancela cuando quieras.";