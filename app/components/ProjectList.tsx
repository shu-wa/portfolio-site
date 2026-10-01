"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, AppWindow, Gamepad2, Grid2X2, Terminal } from "lucide-react";
import { useState } from "react";
import type { Project } from "../../types/project";
import { isTsudowa } from "../../lib/project-public";

export function category(project: Project) {
  const text = `${project.title} ${project.slug} ${project.tech.join(" ")}`;
  if (isTsudowa(project) || /Web|Next|アプリ|React/i.test(text)) return "app";
  if (/ゲーム|Game|Unity|パズル|puzzle|minesweeper/i.test(text)) return "game";
  return "system";
}
const filters = [{ value: "all", label: "すべて", Icon: Grid2X2 }, { value: "app", label: "アプリ・Web", Icon: AppWindow }, { value: "game", label: "ゲーム", Icon: Gamepad2 }, { value: "system", label: "システム", Icon: Terminal }];

function ProjectVisual({ project }: { project: Project }) {
  const mobile = isTsudowa(project);
  const image = project.screenshotUrls?.[0];
  if (image) return <div className={`project-visual ${mobile ? "app-visual" : "image-visual"}`}>
    {mobile && <div className="app-wordmark" aria-hidden="true">TSU<br />DOWA<span>集まるを、もっと気軽に。</span></div>}
    <Image src={image} alt={`${project.title}の画面`} width={1179} height={2556} unoptimized={!image.startsWith("/")} sizes="(max-width: 760px) 100vw, 50vw" className={mobile ? "phone-screen" : "work-screenshot"} />
  </div>;
  const game = category(project) === "game";
  if (game) return <div className="project-visual game-visual" aria-hidden="true"><div className="puzzle-tiles">{[1, 2, 3, 4, 5, 6, 7, 8, "+"].map((n) => <span key={n}>{n}</span>)}</div><span className="visual-label mono">PLAY / THINK / REPEAT</span></div>;
  return <div className="project-visual system-visual" aria-hidden="true"><div className="terminal-preview"><div className="terminal-title"><span /> FIELD NOTES / {project.tech[0]}</div><p><b>&gt;</b> curiosity.start()</p><p><b>&gt;</b> try. build. improve.</p><p className="terminal-success">[ OK ] something new.</p><i /></div><span className="visual-label mono">FROM IDEA TO SYSTEM</span></div>;
}

export default function ProjectList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("all");
  const visible = projects.filter((project) => filter === "all" || category(project) === filter);
  return <>
    <div className="works-toolbar"><div className="work-filters" aria-label="制作物の分類">{filters.map(({ value, label, Icon }) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}><Icon size={15} /><span>{label}</span></button>)}</div><span className="mono" aria-live="polite">{String(visible.length).padStart(2, "0")} PROJECTS</span></div>
    <div className="works-grid">{visible.map((project) => <article className="work-item" key={project.slug}>
      <Link className="work-link" href={`/projects/${encodeURIComponent(project.slug)}`}>
        <ProjectVisual project={project} /><div className="work-meta"><span className="mono">{isTsudowa(project) ? "MOBILE APP / COMING SOON" : category(project) === "game" ? "GAME / EXPERIMENT" : category(project) === "app" ? "WEB APP / DEVELOPMENT" : "SYSTEM / DEVELOPMENT"}</span><ArrowUpRight className="work-arrow" size={23} /></div>
        <h3>{project.title}</h3><p>{project.description}</p><div className="work-tech">{project.tech.slice(0, 4).map((tech) => <span key={tech}>{tech}</span>)}</div>
      </Link>
    </article>)}</div>
    {visible.length === 0 && <p className="empty-works" role="status">この分類の制作物は準備中です。</p>}
  </>;
}
