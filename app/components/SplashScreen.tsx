"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [phase, setPhase] = useState<
    "intro" | "logo" | "blackout" | "fadeout" | "done"
  >("intro");

  useEffect(() => {
    const introTimer = window.setTimeout(() => {
      setPhase("logo");
    }, 100);

    const blackoutTimer = window.setTimeout(() => {
      setPhase("blackout");
    }, 2600);

    const fadeTimer = window.setTimeout(() => {
      setPhase("fadeout");
    }, 3600);

    const doneTimer = window.setTimeout(() => {
      setPhase("done");
    }, 5000);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(blackoutTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") {
    return null;
  }

  const isLogoVisible = phase === "logo";
  const isFadeout = phase === "fadeout";

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black text-white transition-opacity duration-[1400ms] ${
        isFadeout ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`text-center transition-all duration-[1400ms] ease-out ${
          isLogoVisible
            ? "scale-100 opacity-100 blur-0"
            : "scale-95 opacity-0 blur-md"
        }`}
      >
        <p className="mb-4 text-xs font-semibold tracking-[0.7em] text-slate-400 md:text-sm">
          PORTFOLIO
        </p>

        <h1 className="text-3xl font-bold tracking-[0.18em] md:text-6xl">
          Shuwa Tamaki&apos;s
          <br className="md:hidden" /> Portfolio
        </h1>
      </div>
    </div>
  );
}