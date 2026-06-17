import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../../data/projects";

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((project) => project.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/"
          className="mb-10 inline-block text-sm font-semibold text-cyan-400 hover:text-cyan-300"
        >
          ← トップに戻る
        </Link>

        <p className="mb-4 text-sm font-semibold text-cyan-400">Project</p>

        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
          {project.title}
        </h1>

        <p className="mb-8 text-lg leading-8 text-slate-300">
          {project.overview}
        </p>

        <div className="mb-12 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-slate-800 px-3 py-1 text-sm text-cyan-300"
            >
              {tech}
            </span>
          ))}
        </div>

        <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-2xl font-bold">主な機能</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-2xl font-bold">工夫した点</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            {project.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-2xl font-bold">今後の改善</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            {project.future.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}