"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const menuItems = [
  { label: "Top", href: "/#top", number: "01" },
  { label: "About", href: "/#about", number: "02" },
  { label: "Works", href: "/#projects", number: "03" },
  { label: "Contact", href: "/#contact", number: "04" },
  { label: "Admin", href: "/admin", number: "05" },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header className="fixed left-0 top-0 z-40 w-full px-5 py-5 text-white md:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/#top"
            className="max-w-[220px] text-xs font-bold tracking-[0.25em] transition hover:text-cyan-300 sm:max-w-none md:text-base md:tracking-[0.35em]"
          >
            Shuwa Tamaki&apos;s Portfolio
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-full border border-white/30 bg-black/30 px-5 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white hover:text-black"
          >
            Menu
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 bg-black text-white transition duration-500 ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="flex min-h-screen flex-col px-6 py-6 md:px-12">
          <div className="flex items-center justify-between">
            <Link
              href="/#top"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold tracking-[0.3em] text-slate-300 transition hover:text-cyan-300 md:text-base"
            >
              Shuwa Tamaki&apos;s Portfolio
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:text-black"
            >
              Close
            </button>
          </div>

          <nav className="flex flex-1 items-center">
            <div className="w-full">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-6 border-b border-white/10 py-6 transition hover:border-cyan-300 md:py-8"
                >
                  <span className="text-sm font-bold text-cyan-300">
                    {item.number}
                  </span>

                  <span className="text-4xl font-bold tracking-tight transition group-hover:translate-x-4 group-hover:text-cyan-300 md:text-7xl">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="pb-4 text-sm text-slate-500">
            WEB / AWS / GAME / DATABASE
          </div>
        </div>
      </div>
    </>
  );
}