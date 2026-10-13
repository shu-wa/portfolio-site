"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, AppWindow, Gamepad2, Grid2X2, Terminal } from "lucide-react";
import { useState } from "react";
import type { Project } from "../../types/project";
import { isTsudowa } from "../../lib/project-public";

type ProjectFilter = "all" | "app" | "game" | "system";

export function category(project: Project) {
  const text = `${project.title} ${project.slug} ${project.tech.join(" ")}`;
  if (isTsudowa(project) || /Web|Next|アプリ|React/i.test(text)) return "app";
  if (/ゲーム|Game|Unity|パズル|puzzle|minesweeper/i.test(text)) return "game";
  return "system";
}
const filters: { value: ProjectFilter; label: string; Icon: typeof Grid2X2 }[] = [{ value: "all", label: "すべて", Icon: Grid2X2 }, { value: "app", label: "アプリ・Web", Icon: AppWindow }, { value: "game", label: "ゲーム", Icon: Gamepad2 }, { value: "system", label: "システム", Icon: Terminal }];

function ProjectVisual({ project }: { project: Project }) {
  const mobile = isTsudowa(project);
  const screenshots = project.screenshotUrls ?? [];
  const image = screenshots[0];
  if (image) return <div className={`project-visual ${mobile ? "app-visual" : "image-visual"}`}>
    {(mobile ? screenshots.slice(0, 3) : [image]).map((url, index) => <Image key={`${url}-${index}`} src={url} alt={`${project.title}の画面 ${index + 1}`} width={1179} height={2556} unoptimized={!url.startsWith("/")} sizes={mobile ? "180px" : "(max-width: 760px) 100vw, 88vw"} className={mobile ? "phone-screen" : "work-screenshot"} />)}
  </div>;
  return null;
}

export default function ProjectList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const visible = projects.filter((project) => filter === "all" || category(project) === filter);
  return <>
    <div className="works-toolbar"><div className="work-filters" aria-label="制作物の分類">{filters.map(({ value, label, Icon }) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}><Icon size={15} /><span>{label}</span></button>)}</div><span className="mono" aria-live="polite">{visible.length}件</span></div>
    <div className="works-grid">{visible.map((project) => <article className="work-item" key={project.slug}>
      <Link className="work-link" href={`/projects/${encodeURIComponent(project.slug)}`}>
        <div className="work-summary"><div className="work-heading"><span className="work-kind">{isTsudowa(project) ? "公開準備中" : category(project) === "game" ? "ゲーム" : category(project) === "app" ? "アプリ・Web" : "システム"}</span><h3><span>{project.title}</span><ArrowUpRight className="work-arrow" size={23} aria-hidden="true" /></h3></div><div className="work-description"><p>{project.description}</p><div className="work-tech">{project.tech.slice(0, 4).map((tech) => <span key={tech}>{tech}</span>)}</div></div></div>
        <ProjectVisual project={project} />
      </Link>
    </article>)}</div>
    {visible.length === 0 && <p className="empty-works" role="status">この分類の制作物は準備中です。</p>}
  </>;
}
