import Link from "next/link";
import { notFound } from "next/navigation";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { projects as fallbackProjects } from "../../../data/projects";
import type { Project } from "../../../types/project";

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const TABLE_NAME = process.env.DYNAMODB_PROJECTS_TABLE_NAME ?? "PortfolioProjects";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "ap-southeast-2",
});

const documentClient = DynamoDBDocumentClient.from(client);

async function getProject(slug: string): Promise<Project | null> {
  const fallbackProject =
    fallbackProjects.find((project) => project.slug === slug) ?? null;

  try {
    const result = await documentClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { slug },
      })
    );

    if (result.Item) {
      return result.Item as Project;
    }
  } catch (error) {
    console.error("DynamoDBから作品詳細を取得できませんでした", error);
  }

  return fallbackProject;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-24 text-slate-950 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/#projects"
          className="mb-8 inline-flex rounded-full border border-white/30 px-5 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-black"
        >
          ← Worksに戻る
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border-8 border-slate-300 bg-white p-6 shadow-2xl md:p-10">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10">
            <div className="mb-10 flex flex-col gap-6 border-b-4 border-slate-200 pb-8 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-4 text-xs font-black tracking-[0.4em] text-cyan-600">
                  PROJECT DETAIL
                </p>

                <h1 className="max-w-4xl text-4xl font-black leading-tight text-slate-950 md:text-6xl">
                  {project.title}
                </h1>

                <p className="mt-6 max-w-3xl text-lg font-medium leading-9 text-slate-700">
                  {project.overview}
                </p>
              </div>

              <div className="rotate-2 rounded-sm bg-yellow-200 p-5 shadow-xl md:w-72">
                <p className="mb-3 border-b border-slate-900/20 pb-2 text-xs font-black tracking-[0.25em] text-slate-700">
                  SUMMARY
                </p>
                <p className="text-sm font-bold leading-7 text-slate-800">
                  {project.description}
                </p>
              </div>
            </div>

            <section className="mb-10">
              <h2 className="mb-5 text-2xl font-black text-slate-950">
                使用技術
              </h2>

              <div className="flex flex-wrap gap-3">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <MemoCard
                color="bg-cyan-200"
                title="主な機能"
                items={project.features}
              />

              <MemoCard
                color="bg-pink-200"
                title="苦労した点・改善した点"
                items={project.problems}
              />

              <MemoCard
                color="bg-lime-200"
                title="開発を通じて学んだこと"
                items={project.learnings}
              />

              <MemoCard
                color="bg-orange-200"
                title="今後の改善"
                items={project.future}
              />
            </div>

            <section className="mt-10 rounded-3xl border-4 border-slate-200 bg-white/80 p-6 shadow-inner md:p-8">
              <p className="mb-6 text-xs font-black tracking-[0.35em] text-cyan-600">
                DESIGN DECISIONS
              </p>

              <h2 className="mb-8 text-3xl font-black text-slate-950">
                設計の工夫と意思決定
              </h2>

              <div className="space-y-6">
                {project.designDecisions.map((decision, index) => (
                  <div
                    key={`${decision.title}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <h3 className="text-xl font-black text-slate-950">
                        {decision.title}
                      </h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <DecisionBox label="何をしたか" text={decision.what} />
                      <DecisionBox label="なぜそうしたか" text={decision.why} />
                      <DecisionBox label="効果" text={decision.effect} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function MemoCard({
  color,
  title,
  items,
}: {
  color: string;
  title: string;
  items: string[];
}) {
  return (
    <section className={`relative rotate-[-1deg] rounded-sm ${color} p-6 shadow-xl`}>
      <div className="absolute left-1/2 top-[-10px] h-6 w-20 -translate-x-1/2 rotate-2 bg-white/50 shadow-sm" />

      <h2 className="mb-5 border-b border-slate-900/20 pb-3 text-2xl font-black text-slate-950">
        {title}
      </h2>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm font-bold leading-7 text-slate-800"
          >
            ・{item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function DecisionBox({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-black tracking-[0.2em] text-cyan-600">
        {label}
      </p>
      <p className="text-sm font-bold leading-7 text-slate-700">{text}</p>
    </div>
  );
}