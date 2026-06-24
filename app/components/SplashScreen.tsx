"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
      <div className="animate-[logoIntro_2.2s_ease-in-out_forwards] text-center">
        <p className="mb-3 text-sm tracking-[0.6em] text-slate-400">
          PORTFOLIO
        </p>
        <h1 className="text-4xl font-bold tracking-[0.18em] md:text-6xl">
          Shuwa Tamaki&apos;s Portfolio
        </h1>
      </div>
    </div>
  );
}