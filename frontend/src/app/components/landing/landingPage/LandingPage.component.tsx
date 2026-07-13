"use client";

import dynamic from "next/dynamic";
import { LandingFeatures } from "./components/landingFeatures/LandingFeatures.component";
import { LandingPricing } from "./components/landingPricing/LandingPricing.component";
import { LandingCTA } from "./components/landingCTA/LandingCTA.component";
import { LandingHero } from "./components/landingHero/LandingHero.component";

const LandingScroll = dynamic(
  () =>
    import("./components/landingScroll/LandingScroll.component").then(
      (m) => m.LandingScroll,
    ),
  { ssr: false },
);

export const LandingPage = () => {
  return (
    <main>
      <LandingHero />
      <LandingScroll />
      <LandingFeatures />
      <LandingPricing />
      <LandingCTA />
    </main>
  );
};