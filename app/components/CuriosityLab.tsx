"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, RefreshCw, Volume2 } from "lucide-react";

const ideas = ["アプリをつくる", "ゲームをつくる", "音をつくる", "仕組みをつくる", "まだ知らないもの"];
export function CuriosityPrompt() {
  const [index, setIndex] = useState(0);
  return <div className="curiosity-prompt"><span className="mono">WHAT&apos;S NEXT?</span><strong>{ideas[index]}</strong><button className="icon-button" onClick={() => setIndex((value) => (value + 1) % ideas.length)} aria-label="次の好奇心を見る" title="次の好奇心"><RefreshCw size={18} /></button></div>;
}

export function GuitarLab() {
  const context = useRef<AudioContext | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    void context.current?.close();
  }, []);
  async function pluck(index: number) {
    const frequencies = [82.41, 110, 146.83, 196, 246.94, 329.63];
    const audio = context.current ??= new AudioContext();
    await audio.resume();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequencies[index];
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(0.14, audio.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1.3);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(); oscillator.stop(audio.currentTime + 1.35);
    if (timer.current) clearTimeout(timer.current);
    setActive(index); timer.current = setTimeout(() => setActive(null), 600);
  }
  return <div className="guitar-lab" id="playground">
    <div className="guitar-caption"><span className="mono">A LITTLE PLAYGROUND</span><Volume2 size={19} aria-label="弦を選ぶと音が鳴ります" /></div>
    <div className="guitar-strings">{["E2", "A2", "D3", "G3", "B3", "E4"].map((note, index) => <button key={note} className={active === index ? "string is-playing" : "string"} onClick={() => void pluck(index)} title={`${note}を鳴らす`} aria-label={`${note}の弦を鳴らす`}><span className="mono">{note}</span><i style={{ height: 4 - index * 0.45 }} /><b>+</b></button>)}</div>
    <div className="guitar-bottom"><p>コードも、コード進行も。</p><ArrowDown size={18} /></div>
  </div>;
}
