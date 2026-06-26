"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  direction?: "left" | "right" | "up";
  delay?: number;
  className?: string;
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = ref.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.35,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

    const hiddenClass = {
        left: "-translate-x-10 opacity-0 md:-translate-x-32",
        right: "translate-x-10 opacity-0 md:translate-x-32",
        up: "translate-y-20 opacity-0",
    }[direction];

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "translate-x-0 translate-y-0 opacity-100" : hiddenClass
      } ${className}`}
    >
      {children}
    </div>
  );
}