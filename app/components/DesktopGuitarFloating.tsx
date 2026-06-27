"use client";

import { useEffect, useState } from "react";
import VerticalGuitarNeck from "./VerticalGuitarNeck";

export default function DesktopGuitarFloating() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const aboutSection = document.getElementById("about");

    if (!aboutSection) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.08,
        rootMargin: "-80px 0px -80px 0px",
      }
    );

    observer.observe(aboutSection);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed left-6 top-20 z-30 hidden h-[calc(100vh-5rem)] w-52 transition-all duration-700 ease-out lg:block ${
        isVisible
          ? "pointer-events-auto translate-x-0 opacity-100 blur-0"
          : "pointer-events-none -translate-x-6 opacity-0 blur-sm"
      }`}
    >
      <VerticalGuitarNeck />
    </div>
  );
}