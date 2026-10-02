"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useRef } from "react";

const links = [
  { name: "制作物一覧", en: "Works", href: "/#projects" },
  { name: "私の強み", en: "Strengths", href: "/#mindset" },
  { name: "プロフィール", en: "Profile", href: "/#about" },
  { name: "お問い合わせ", en: "Contact", href: "/#contact" },
];

export default function SiteHeader() {
  const dialog = useRef<HTMLDialogElement>(null);
  function close() { dialog.current?.close(); document.body.style.overflow = ""; }
  return <>
    <header className="site-header">
      <Link className="brand" href="/#top" aria-label="玉木秀杷 トップへ">ST<span className="brand-plus">+</span></Link>
      <nav className="desktop-nav" aria-label="メインナビゲーション">
        {links.map((link) => <Link key={link.name} href={link.href}>{link.name}</Link>)}
      </nav>
      <button className="icon-button menu-toggle" aria-label="メニューを開く" title="メニュー" onClick={() => { dialog.current?.showModal(); document.body.style.overflow = "hidden"; }}><Menu size={23} /></button>
    </header>
    <dialog ref={dialog} className="menu-dialog" onCancel={close} onClose={() => { document.body.style.overflow = ""; }}>
      <div className="menu-top"><span className="brand">ST<span className="brand-plus">+</span></span><button className="icon-button" aria-label="メニューを閉じる" onClick={close}><X /></button></div>
      <nav aria-label="モバイルナビゲーション">{links.map((link, index) => <Link key={link.name} href={link.href} onClick={close}><span className="mono">0{index + 1}</span><span>{link.name}<small>{link.en}</small></span><ArrowUpRight /></Link>)}</nav>
      <p className="mono">CURIOUS BY NATURE. MAKER BY CHOICE.</p>
    </dialog>
  </>;
}
