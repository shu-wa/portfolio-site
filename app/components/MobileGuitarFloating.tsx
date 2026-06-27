"use client";

import { useEffect, useState } from "react";
import MobileGuitarNeck from "./MobileGuitarNeck";

export default function MobileGuitarFloating() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hobbySection = document.getElementById("hobby");

    if (!hobbySection) {
      return;
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
            setIsVisible(entry.isIntersecting);
        },
        {
            threshold: 0.01,
            rootMargin: "0px 0px 260px 0px",
        }
    );

    observer.observe(hobbySection);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed left-0 right-0 top-20 z-40 px-4 transition-all duration-700 ease-out lg:hidden ${
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100 blur-0"
          : "pointer-events-none -translate-y-2 opacity-0 blur-sm"
      }`}
    >
      <div className="mx-auto max-w-2xl">
        <MobileGuitarNeck />
      </div>
    </div>
  );
}