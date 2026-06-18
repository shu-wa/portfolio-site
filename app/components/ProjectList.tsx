"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Project = {
  slug: string;
  title: string;
  description: string;
  overview: string;
  tech: readonly string[];
  features: readonly string[];
  points: readonly string[];
  future: readonly string[];
};

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("作品データの取得に失敗しました", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) {
    return <p className="text-slate-300">作品データを読み込み中...</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {projects.map((project) => (
        <article
          key={project.slug}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-400"
        >
          <h3 className="mb-3 text-xl font-bold">{project.title}</h3>

          <p className="mb-4 text-sm leading-6 text-slate-300">
            {project.description}
          </p>

          <div className="mb-5 flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-slate-800 px-3 py-1 text-xs text-cyan-300"
              >
                {tech}
              </span>
            ))}
          </div>

          <Link
            href={`/projects/${project.slug}`}
            className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
          >
            詳細を見る →
          </Link>
        </article>
      ))}
    </div>
  );
}