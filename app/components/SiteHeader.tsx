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

const githubUrl = "https://github.com/shu-wa";

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-current"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.28 9.28 0 0 1 12 6.99c.85 0 1.7.12 2.5.36 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.08 10.08 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

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

          <div className="flex items-center gap-3">
                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub profile"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-white hover:text-black"
                >
                    <GitHubIcon />
                </a>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="rounded-full border border-white/30 bg-black/30 px-5 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white hover:text-black"
                >
                    Menu
                </button>
            </div>
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

          <div className="flex flex-col gap-4 pb-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                <span>WEB / AWS / GAME / DATABASE</span>

                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-white transition hover:bg-white hover:text-black"
                >
                    <GitHubIcon />
                    GitHub Profile
                </a>
            </div>
        </div>
      </div>
    </>
  );
}