"use client";

import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { label: "Top", href: "/#top" },
  { label: "About", href: "/#about" },
  { label: "Works", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
  { label: "Admin", href: "/admin" },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-40 w-full px-6 py-5 text-white">
      <div className="flex items-center justify-between">
        <Link
          href="/#top"
          className="text-sm font-bold tracking-[0.35em] transition hover:text-cyan-300 md:text-base"
        >
          Shuwa Tamaki&apos;s Portfolio
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="rounded-full border border-white/30 bg-black/30 px-5 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white hover:text-black"
          >
            Menu
          </button>

          {isOpen && (
            <nav className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-5 py-4 text-sm font-semibold text-slate-200 transition hover:bg-white hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}