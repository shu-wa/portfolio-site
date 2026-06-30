"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import type { DesignDecision,Project } from "../../types/project";
import type { DragEvent } from "react";


const emptyProject: Project = {
  slug: "",
  title: "",
  description: "",
  overview: "",
  tech: [],
  features: [],
  designDecisions: [],
  problems: [],
  learnings: [],
  future: [],
  order: 999,
};

function arrayToText(items: string[]) {
  return items.join("\n");
}

function textToArray(text: string) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProjectOrder(projects: Project[]) {
  return [...projects]
    .sort((a, b) => {
      const orderDiff = (a.order ?? 999) - (b.order ?? 999);

      if (orderDiff !== 0) {
        return orderDiff;
      }

      return a.title.localeCompare(b.title, "ja");
    })
    .map((project, index) => ({
      ...project,
      order: index + 1,
    }));
}

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
}



const emptyDecision: DesignDecision = {
  title: "",
  what: "",
  why: "",
  effect: "",
};

export default function ProjectAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project>({
    ...emptyProject,
    });
  const [originalSlug, setOriginalSlug] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [draggingSlug, setDraggingSlug] = useState("");

  const [techText, setTechText] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [problemsText, setProblemsText] = useState("");
  const [learningsText, setLearningsText] = useState("");
  const [futureText, setFutureText] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function getIdToken() {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  }

  async function fetchProjects() {
    try {
        const response = await fetch("/api/projects");
        const data = await response.json();

        if (!response.ok) {
        setMessage(data.error ?? "作品一覧の取得に失敗しました。");
        return;
        }

        setProjects(normalizeProjectOrder(data));
    } catch (error) {
        console.error("作品一覧取得エラー", error);
        setMessage("作品一覧の取得に失敗しました。");
    }
    }

  function selectProject(project: Project) {
        const normalizedProject: Project = {
            ...project,
            tech: project.tech ?? [],
            features: project.features ?? [],
            designDecisions: project.designDecisions ?? [],
            problems: project.problems ?? [],
            learnings: project.learnings ?? [],
            future: project.future ?? [],
        };

        setSelectedProject(normalizedProject);
        setOriginalSlug(project.slug);
        setTechText(arrayToText(normalizedProject.tech));
        setFeaturesText(arrayToText(normalizedProject.features));
        setProblemsText(arrayToText(normalizedProject.problems));
        setLearningsText(arrayToText(normalizedProject.learnings));
        setFutureText(arrayToText(normalizedProject.future));
        setMessage("");
    }

    function createNewProject() {
        setSelectedProject({
            ...emptyProject,
            order: projects.length + 1,
        });
        setOriginalSlug("");
        setTechText("");
        setFeaturesText("");
        setProblemsText("");
        setLearningsText("");
        setFutureText("");
        setMessage("");
    }

    function updateDesignDecision(
        index: number,
        field: keyof DesignDecision,
        value: string
        ) {
        const newDesignDecisions = selectedProject.designDecisions.map(
            (decision, currentIndex) => {
            if (currentIndex !== index) {
                return decision;
            }

            return {
                ...decision,
                [field]: value,
            };
            }
        );

        setSelectedProject({
            ...selectedProject,
            designDecisions: newDesignDecisions,
        });
        }

        function addDesignDecision() {
        setSelectedProject({
            ...selectedProject,
            designDecisions: [
            ...(selectedProject.designDecisions ?? []),
            { ...emptyDecision },
            ],
        });
        }

        function removeDesignDecision(index: number) {
        setSelectedProject({
            ...selectedProject,
            designDecisions: selectedProject.designDecisions.filter(
            (_decision, currentIndex) => currentIndex !== index
            ),
        });
    }

  async function saveProject() {
    try {
      setIsSaving(true);
      setMessage("");

      const idToken = await getIdToken();

      if (!idToken) {
        setMessage("ログイン情報を取得できませんでした。");
        return;
      }

      const projectToSave: Project = {
            ...selectedProject,
            tech: textToArray(techText),
            features: textToArray(featuresText),
            problems: textToArray(problemsText),
            learnings: textToArray(learningsText),
            future: textToArray(futureText),
            designDecisions: selectedProject.designDecisions.filter(
                (decision) =>
                decision.title.trim() ||
                decision.what.trim() ||
                decision.why.trim() ||
                decision.effect.trim()
            ),
            order:
        originalSlug === ""
            ? projects.length + 1
            : Number(selectedProject.order ?? projects.length + 1),
        };

      if (!projectToSave.slug || !projectToSave.title) {
            setMessage("slugとタイトルは必須です。");
            return;
        }

        const isNew = originalSlug === "";

      const response = await fetch(
        isNew ? "/api/projects" : `/api/projects/${originalSlug}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(projectToSave),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "作品の保存に失敗しました。");
        return;
      }

        setMessage(data.message);
        await fetchProjects();

        if (isNew) {
        setOriginalSlug(projectToSave.slug);
        }
    } catch (error) {
      console.error("作品保存エラー", error);
      setMessage("通信エラーが発生しました。");
    } finally {
      setIsSaving(false);
    }
  }

  function handleProjectDragStart(slug: string) {
        setDraggingSlug(slug);
        }

        function handleProjectDragOver(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        }

        function handleProjectDrop(targetSlug: string) {
        if (!draggingSlug || draggingSlug === targetSlug) {
            setDraggingSlug("");
            return;
        }

        const fromIndex = projects.findIndex(
            (project) => project.slug === draggingSlug
        );
        const toIndex = projects.findIndex((project) => project.slug === targetSlug);

        if (fromIndex === -1 || toIndex === -1) {
            setDraggingSlug("");
            return;
        }

        const reorderedProjects = moveArrayItem(projects, fromIndex, toIndex).map(
            (project, index) => ({
            ...project,
            order: index + 1,
            })
        );

        setProjects(reorderedProjects);

        const selected = reorderedProjects.find(
            (project) => project.slug === selectedProject.slug
        );

        if (selected) {
            setSelectedProject(selected);
        }

        setDraggingSlug("");
        setMessage("表示順を変更しました。反映するには「表示順を保存」を押してください。");
        }

        function handleProjectDragEnd() {
        setDraggingSlug("");
    }

    async function saveProjectOrder() {
        try {
            setIsSavingOrder(true);
            setMessage("");

            const idToken = await getIdToken();

            if (!idToken) {
            setMessage("ログイン情報を取得できませんでした。");
            return;
            }

            const orderedProjects = projects.map((project, index) => ({
            ...project,
            order: index + 1,
            }));

            const responses = await Promise.all(
            orderedProjects.map((project) =>
                fetch(`/api/projects/${project.slug}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify(project),
                })
            )
            );

            const failedResponse = responses.find((response) => !response.ok);

            if (failedResponse) {
            setMessage("表示順の保存に失敗しました。");
            return;
            }

            setProjects(orderedProjects);

            const selected = orderedProjects.find(
            (project) => project.slug === selectedProject.slug
            );

            if (selected) {
            setSelectedProject(selected);
            }

            setMessage("表示順を保存しました。");
            await fetchProjects();
        } catch (error) {
            console.error("表示順保存エラー", error);
            setMessage("通信エラーが発生しました。");
        } finally {
            setIsSavingOrder(false);
        }
    }

  async function deleteProject(slug: string) {
    const confirmed = window.confirm("この作品を削除しますか？");

    if (!confirmed) {
      return;
    }

    try {
      const idToken = await getIdToken();

      if (!idToken) {
        setMessage("ログイン情報を取得できませんでした。");
        return;
      }

      const response = await fetch(`/api/projects/${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
            setMessage(data.error ?? "作品の削除に失敗しました。");
            return;
        }

        createNewProject();
        await fetchProjects();
        setMessage(data.message);
    } catch (error) {
      console.error("作品削除エラー", error);
      setMessage("通信エラーが発生しました。");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">作品管理</h2>
          <p className="mt-2 text-sm text-slate-300">
            DynamoDBに保存されている作品情報を追加・編集・削除できます。
          </p>
        </div>

        <button
          onClick={createNewProject}
          className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          新規作成
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <p className="font-bold text-cyan-300">表示順</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                    作品をドラッグして順番を変更できます。
                    </p>
                </div>

                <button
                    type="button"
                    onClick={saveProjectOrder}
                    disabled={isSavingOrder}
                    className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                >
                    {isSavingOrder ? "保存中..." : "保存"}
                </button>
                </div>

                <div className="space-y-2">
                {projects.map((project) => {
                    const isSelected = selectedProject.slug === project.slug;
                    const isDragging = draggingSlug === project.slug;

                    return (
                    <div
                        key={project.slug}
                        draggable
                        onDragStart={() => handleProjectDragStart(project.slug)}
                        onDragOver={handleProjectDragOver}
                        onDrop={() => handleProjectDrop(project.slug)}
                        onDragEnd={handleProjectDragEnd}
                        className={`rounded-xl border p-3 transition ${
                        isSelected
                            ? "border-cyan-400 bg-cyan-950/40"
                            : "border-slate-800 bg-slate-900"
                        } ${isDragging ? "opacity-40" : "opacity-100"}`}
                    >
                        <button
                        type="button"
                        onClick={() => selectProject(project)}
                        className="flex w-full items-center gap-3 text-left"
                        >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-cyan-300">
                            {project.order}
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold">
                            {project.title}
                            </span>
                            <span className="mt-1 block truncate text-sm text-slate-400">
                            {project.slug}
                            </span>
                        </span>

                        <span className="cursor-grab text-slate-500">☰</span>
                        </button>
                    </div>
                    );
                })}
                </div>
            </div>
        </div>

        <div className="space-y-4 lg:col-span-2">

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-300">
              タイトル
            </span>
            <input
              value={selectedProject.title}
              onChange={(event) =>
                setSelectedProject({
                  ...selectedProject,
                  title: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              placeholder="例：Cat Museum Stealth"
            />
          </label>
          <label className="block">
                <span className="mb-1 block text-sm font-semibold">slug</span>
                    <input
                        value={selectedProject.slug}
                        disabled={originalSlug !== ""}
                        onChange={(event) =>
                            setSelectedProject({
                            ...selectedProject,
                            slug: event.target.value,
                            })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white disabled:opacity-60"
                        placeholder="example-project"
                        />
                        {originalSlug !== "" && (
                        <p className="mt-1 text-xs text-slate-400">
                            既存作品のslugは変更できません。
                        </p>
                        )}
          </label>

          <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                <p className="mb-1 text-sm font-semibold">表示順</p>
                <p className="text-2xl font-black text-cyan-300">
                    {selectedProject.order ?? "-"}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                    表示順は左側の作品一覧をドラッグして変更してください。
                    同じ数値が入らないよう、保存時に1から順番に自動で振り直します。
                </p>
            </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">説明</span>
            <textarea
              value={selectedProject.description}
              onChange={(event) =>
                setSelectedProject({
                  ...selectedProject,
                  description: event.target.value,
                })
              }
              className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">概要</span>
            <textarea
              value={selectedProject.overview}
              onChange={(event) =>
                setSelectedProject({
                  ...selectedProject,
                  overview: event.target.value,
                })
              }
              className="min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              技術スタック：1行に1つ
            </span>
            <textarea
              value={techText}
              onChange={(event) => setTechText(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              主な機能：1行に1つ
            </span>
            <textarea
              value={featuresText}
              onChange={(event) => setFeaturesText(event.target.value)}
              className="min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>

          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                    <h3 className="text-lg font-bold">設計の工夫と意思決定</h3>
                    <p className="mt-1 text-sm text-slate-400">
                        「何をしたか」「なぜそうしたか」「効果」を管理できます。
                    </p>
                    </div>

                    <button
                    onClick={addDesignDecision}
                    className="rounded-xl border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-950"
                    >
                    追加
                    </button>
                </div>

                <div className="space-y-5">
                    {selectedProject.designDecisions.map((decision, index) => (
                    <article
                        key={index}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                    >
                        <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="font-bold text-cyan-300">
                            設計判断 {index + 1}
                        </p>

                        <button
                            onClick={() => removeDesignDecision(index)}
                            className="rounded-lg border border-red-400 px-3 py-1 text-sm font-semibold text-red-300 transition hover:bg-red-950"
                        >
                            削除
                        </button>
                        </div>

                        <label className="mb-3 block">
                        <span className="mb-1 block text-sm font-semibold">タイトル</span>
                        <input
                            value={decision.title}
                            onChange={(event) =>
                            updateDesignDecision(index, "title", event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                        />
                        </label>

                        <label className="mb-3 block">
                        <span className="mb-1 block text-sm font-semibold">何をしたか</span>
                        <textarea
                            value={decision.what}
                            onChange={(event) =>
                            updateDesignDecision(index, "what", event.target.value)
                            }
                            className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                        />
                        </label>

                        <label className="mb-3 block">
                        <span className="mb-1 block text-sm font-semibold">なぜそうしたか</span>
                        <textarea
                            value={decision.why}
                            onChange={(event) =>
                            updateDesignDecision(index, "why", event.target.value)
                            }
                            className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                        />
                        </label>

                        <label className="block">
                        <span className="mb-1 block text-sm font-semibold">効果</span>
                        <textarea
                            value={decision.effect}
                            onChange={(event) =>
                            updateDesignDecision(index, "effect", event.target.value)
                            }
                            className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                        />
                        </label>
                    </article>
                    ))}
                </div>
            </section>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              苦労した点：1行に1つ
            </span>
            <textarea
              value={problemsText}
              onChange={(event) => setProblemsText(event.target.value)}
              className="min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              学んだこと：1行に1つ
            </span>
            <textarea
              value={learningsText}
              onChange={(event) => setLearningsText(event.target.value)}
              className="min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              今後の改善：1行に1つ
            </span>
            <textarea
              value={futureText}
              onChange={(event) => setFutureText(event.target.value)}
              className="min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">表示順</span>
            <input
              type="number"
              value={selectedProject.order ?? 999}
              onChange={(event) =>
                setSelectedProject({
                  ...selectedProject,
                  order: Number(event.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveProject}
              disabled={isSaving}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>

            {originalSlug && (
                <button
                    onClick={() => deleteProject(originalSlug)}
                    className="rounded-xl border border-red-400 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-950"
                >
                    削除
                </button>
            )}
          </div>

          {message && <p className="text-sm text-cyan-300">{message}</p>}
        </div>
      </div>
    </div>
  );
}