"use client";

import { Bodies, Body, Composite, Constraint, Engine, Query, Sleeping } from "matter-js";
import { ArrowUpDown, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const width = 480;
const height = 280;
const labels = ["TRY", "?", "MAKE", "+", "CODE", "!", "PLAY", "AI"];
const colors = ["#c8f553", "#ed4b36", "#9ac6ed", "#e7b5d1"];

export default function PhysicsSketch() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef<{ kick: () => void; flip: () => void; reset: () => void } | null>(null);
  const [reversed, setReversed] = useState(false);
  const [actions, setActions] = useState(0);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    element.width = width * ratio; element.height = height * ratio;
    context.scale(ratio, ratio);
    const engine = Engine.create({ enableSleeping: true });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const blocks = labels.map((label, index) => Bodies.rectangle(65 + (index % 4) * 115, 88 + Math.floor(index / 4) * 91, 83, 57, { label, chamfer: { radius: 6 }, restitution: 0.55, friction: 0.4, angle: (index % 3 - 1) * 0.12 }));
    Composite.add(engine.world, [...blocks,
      Bodies.rectangle(width / 2, height + 12, width, 30, { isStatic: true }),
      Bodies.rectangle(width / 2, -12, width, 30, { isStatic: true }),
      Bodies.rectangle(-12, height / 2, 30, height, { isStatic: true }),
      Bodies.rectangle(width + 12, height / 2, 30, height, { isStatic: true }),
    ]);
    let frame = 0;
    let lastTime = 0;
    let until = 0;
    let visible = true;
    let drag: Constraint | null = null;
    function draw() {
      context!.clearRect(0, 0, width, height);
      context!.fillStyle = "#f5e5ef"; context!.fillRect(0, 0, width, height);
      context!.strokeStyle = "#171b1720"; context!.lineWidth = 1;
      for (let x = 20; x < width; x += 30) { context!.beginPath(); context!.moveTo(x, 0); context!.lineTo(x, height); context!.stroke(); }
      for (let y = 10; y < height; y += 30) { context!.beginPath(); context!.moveTo(0, y); context!.lineTo(width, y); context!.stroke(); }
      blocks.forEach((body, index) => {
        context!.save(); context!.translate(body.position.x, body.position.y); context!.rotate(body.angle);
        context!.fillStyle = "#171b17"; context!.beginPath(); context!.roundRect(-39, -25, 83, 57, 6); context!.fill();
        context!.fillStyle = colors[index % colors.length]; context!.strokeStyle = "#171b17"; context!.lineWidth = 2;
        context!.beginPath(); context!.roundRect(-41.5, -28.5, 83, 57, 6); context!.fill(); context!.stroke();
        context!.fillStyle = "#171b17"; context!.font = "bold 22px sans-serif"; context!.textAlign = "center"; context!.textBaseline = "middle"; context!.fillText(body.label, 0, 1); context!.restore();
      });
    }
    function tick(time: number) {
      frame = 0;
      if (!visible || document.hidden) return;
      Engine.update(engine, lastTime ? Math.min(Math.max(time - lastTime, 1), 1000 / 60) : 1000 / 60); lastTime = time; draw();
      if (performance.now() < until || drag) frame = requestAnimationFrame(tick);
    }
    function wake() {
      blocks.forEach((body) => Sleeping.set(body, false));
      until = performance.now() + (reducedMotion.matches ? 650 : 4000);
      if (!frame && visible && !document.hidden) { lastTime = performance.now(); frame = requestAnimationFrame(tick); }
    }
    function reset() {
      if (drag) { Composite.remove(engine.world, drag); drag = null; }
      blocks.forEach((body, index) => { Body.setPosition(body, { x: 65 + (index % 4) * 115, y: 88 + Math.floor(index / 4) * 91 }); Body.setVelocity(body, { x: 0, y: 0 }); Body.setAngularVelocity(body, 0); Body.setAngle(body, (index % 3 - 1) * 0.12); });
      engine.gravity.y = 1; until = 0; if (frame) cancelAnimationFrame(frame); frame = 0; draw();
    }
    controls.current = {
      kick() { blocks.forEach((body, index) => { Body.setVelocity(body, { x: (index % 4 - 1.5) * 3, y: -8 * engine.gravity.y }); Body.setAngularVelocity(body, (index % 2 ? 1 : -1) * 0.12); }); wake(); },
      flip() { engine.gravity.y *= -1; wake(); }, reset,
    };
    function point(event: PointerEvent) {
      const rect = element!.getBoundingClientRect();
      const scale = Math.min(rect.width / width, rect.height / height);
      return { x: (event.clientX - rect.left - (rect.width - width * scale) / 2) / scale, y: (event.clientY - rect.top - (rect.height - height * scale) / 2) / scale };
    }
    function down(event: PointerEvent) {
      const position = point(event);
      const body = Query.point(blocks, position)[0];
      if (!body) return;
      element!.setPointerCapture(event.pointerId);
      drag = Constraint.create({ pointA: position, bodyB: body, pointB: { x: position.x - body.position.x, y: position.y - body.position.y }, stiffness: 0.2, length: 0 });
      Composite.add(engine.world, drag); wake();
    }
    function move(event: PointerEvent) { if (drag) { drag.pointA = point(event); wake(); } }
    function up() { if (drag) { Composite.remove(engine.world, drag); drag = null; wake(); } }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && performance.now() < until && !frame) frame = requestAnimationFrame(tick); });
    observer.observe(element);
    function visibility() { if (!document.hidden && visible && performance.now() < until && !frame) frame = requestAnimationFrame(tick); }
    document.addEventListener("visibilitychange", visibility);
    element.addEventListener("pointerdown", down); element.addEventListener("pointermove", move); element.addEventListener("pointerup", up); element.addEventListener("pointercancel", up); element.addEventListener("lostpointercapture", up);
    draw();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect(); document.removeEventListener("visibilitychange", visibility);
      element.removeEventListener("pointerdown", down); element.removeEventListener("pointermove", move); element.removeEventListener("pointerup", up); element.removeEventListener("pointercancel", up); element.removeEventListener("lostpointercapture", up);
      Composite.clear(engine.world, false); Engine.clear(engine); controls.current = null;
    };
  }, []);
  return <div className="physics-sketch"><div className="physics-field"><canvas ref={canvas} className="physics-canvas" aria-hidden="true" /></div><div className="physics-controls"><span className="mono" role="status">{actions ? `${actions} EXPERIMENTS` : "PHYSICS / READY"}</span><div><button className="icon-button" title="パーツを跳ねさせる" aria-label="パーツを跳ねさせる" onClick={() => { controls.current?.kick(); setActions(actions + 1); }}><Sparkles size={18} /></button><button className="icon-button" title="重力を反転" aria-label="重力を反転" aria-pressed={reversed} onClick={() => { controls.current?.flip(); setReversed(!reversed); setActions(actions + 1); }}><ArrowUpDown size={18} /></button><button className="icon-button" title="パーツを元に戻す" aria-label="パーツを元に戻す" onClick={() => { controls.current?.reset(); setReversed(false); setActions(0); }}><RotateCcw size={18} /></button></div></div></div>;
}
