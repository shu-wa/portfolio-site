"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { AppWindow, ArrowDownRight, ArrowRight, CheckCircle2, Download, FileJson, Gamepad2, MoveDown, RefreshCw, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCuriosity } from "./CuriosityContext";
import IdeaNotes from "./IdeaNotes";

const PhysicsSketch = dynamic(() => import("./PhysicsSketch"), {
  ssr: false,
  loading: () => <div className="physics-loading" role="status"><Gamepad2 size={44} /><span className="mono">LOADING</span></div>,
});
const modes = [
  { id: "app" as const, name: "アプリ", label: "アプリを作る", Icon: AppWindow },
  { id: "game" as const, name: "ゲーム", label: "ゲームを作る", Icon: Gamepad2 },
  { id: "system" as const, name: "仕組み", label: "仕組みを作る", Icon: Terminal },
];

function SystemSketch() {
  const [title, setTitle] = useState("新しい制作物");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{ title: string; status: string; tags: string[] } | null>(null);
  const [error, setError] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  function run() {
    timers.current.forEach(clearTimeout);
    const normalized = title.trim();
    if (!normalized) { setError("タイトルを入力してください。"); return; }
    setError(""); setResult(null); setStep(1);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260;
    timers.current = [
      setTimeout(() => setStep(2), delay),
      setTimeout(() => { setResult({ title: normalized, status: "idea", tags: [] }); setStep(3); }, delay * 2),
    ];
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "curiosity-idea.json"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="system-sketch demo-surface">
    <div className="sketch-app-header"><span className="mono"><Terminal size={16} /> IDEA → DATA</span><span className="mono">LOCAL</span></div>
    <div className="system-input"><label htmlFor="sketch-title">アイデアのタイトル</label><div><input id="sketch-title" maxLength={60} value={title} onChange={(event) => { timers.current.forEach(clearTimeout); setTitle(event.target.value); setStep(0); setResult(null); setError(""); }} /><button className="icon-button" aria-label="JSONをつくる" title="JSONをつくる" disabled={step > 0 && step < 3} onClick={run}><ArrowRight size={19} /></button></div></div>
    <ol className="system-flow">{[{ label: "入力", Icon: Terminal }, { label: "整える", Icon: CheckCircle2 }, { label: "JSON", Icon: FileJson }].map(({ label, Icon }, index) => <li key={label} data-active={step > index}><Icon size={22} /><span>{label}</span>{index < 2 && <ArrowRight className="flow-arrow" size={14} />}</li>)}</ol>
    <div className="system-output"><pre tabIndex={0} role="region" aria-label="生成されるJSON">{result ? JSON.stringify(result, null, 2) : '{ "title": "?", "status": "idea" }'}</pre><button className="icon-button" aria-label="JSONをダウンロード" title="JSONをダウンロード" disabled={!result} onClick={download}><Download size={18} /></button></div>
    <p className="sketch-status" role="status">{error || (result ? "JSONを作成しました" : step ? "処理中" : "")}</p>
  </div>;
}

export default function CuriosityHero() {
  const { mode, selectMode, selectFilter } = useCuriosity();
  const index = modes.findIndex((item) => item.id === mode);
  const current = modes[index];
  return <section id="top" className="hero" data-mode={mode}>
    <Image className="hero-image" src="/curiosity-workbench.webp" alt="ゲームコントローラー、回路、ギターピックなど、好奇心を表す実験道具" fill preload sizes="100vw" />
    <div className="hero-content"><div className="hero-intro"><span className="mono">SHUWA TAMAKI</span><span className="mono">PORTFOLIO / APPS, GAMES &amp; WEB</span></div>
      <h1><span>とりあえず、</span><span>なんでも</span><span>やってみる<span className="hero-exclaim">!!</span></span></h1>
      <div className="hero-bottom"><p>アプリ・ゲーム・Webをつくる。<br />玉木秀杷のポートフォリオです。</p><a className="round-link" href="#projects" aria-label="制作物一覧へ" onClick={() => selectFilter("all")}><ArrowDownRight size={29} /></a></div>
      <div className="curiosity-controls"><div className="mode-segment" role="group" aria-label="制作モード">{modes.map(({ id, name, label, Icon }) => <button key={id} aria-label={label} aria-pressed={mode === id} onClick={() => selectMode(id)}><Icon size={16} aria-hidden="true" /><span>{name}</span></button>)}</div><button className="icon-button mode-cycle" aria-label="次の制作モード" title={`次は、${modes[(index + 1) % modes.length].label}`} onClick={() => selectMode(modes[(index + 1) % modes.length].id)}><RefreshCw key={mode} size={18} /></button></div>
    </div>
    <div className="curiosity-stage"><div className="curiosity-caption"><span className="mono" aria-live="polite">0{index + 1} / {current.label}</span><span className="mono">INTERACTIVE SKETCH</span></div><div className="curiosity-demo" key={mode}>{mode === "app" ? <IdeaNotes /> : mode === "game" ? <PhysicsSketch /> : <SystemSketch />}</div></div>
    <div className="hero-foot"><span className="mono">好奇心を、動くものに。</span><a href="#projects" className="scroll-label mono">制作物を見る<MoveDown size={17} /></a></div>
  </section>;
}
