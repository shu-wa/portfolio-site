import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects as fallbackProjects } from "../../../data/projects";
import type { Project } from "../../../types/project";

export const dynamic = "force-dynamic";

const TABLE_NAME = "PortfolioProjects";
const REGION = "ap-southeast-2";

const dynamoDbClient = new DynamoDBClient({
  region: REGION,
});

const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProject(slug: string): Promise<Project | null> {
  try {
    const result = await documentClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          slug,
        },
      })
    );

    if (result.Item) {
      return result.Item as Project;
    }
  } catch (error) {
    console.error("DynamoDBから作品詳細を取得できませんでした", error);
  }

  const fallbackProject = fallbackProjects.find(
    (project) => project.slug === slug
  );

  return fallbackProject ?? null;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

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

        {project.designDecisions.length > 0 && (
          <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-bold">設計の工夫と意思決定</h2>

            <div className="space-y-6">
              {project.designDecisions.map((decision) => (
                <article
                  key={decision.title}
                  className="rounded-xl bg-slate-950 p-5"
                >
                  <h3 className="mb-3 text-lg font-bold text-cyan-300">
                    {decision.title}
                  </h3>

                  <div className="space-y-3 text-sm leading-7 text-slate-300">
                    <p>
                      <span className="font-bold text-white">何をしたか：</span>
                      {decision.what}
                    </p>

                    <p>
                      <span className="font-bold text-white">
                        なぜそうしたか：
                      </span>
                      {decision.why}
                    </p>

                    <p>
                      <span className="font-bold text-white">効果：</span>
                      {decision.effect}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {project.problems.length > 0 && (
          <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-bold">苦労した点・改善した点</h2>
            <ul className="list-disc space-y-2 pl-5 text-slate-300">
              {project.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </section>
        )}

        {project.learnings.length > 0 && (
          <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-bold">開発を通じて学んだこと</h2>
            <ul className="list-disc space-y-2 pl-5 text-slate-300">
              {project.learnings.map((learning) => (
                <li key={learning}>{learning}</li>
              ))}
            </ul>
          </section>
        )}

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