"use client";

import Link from "next/link";
import {
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Project } from "../../types/project";

type NotePosition = {
  x: number;
  y: number;
  rotate: number;
};

type DragState = {
  slug: string;
  offsetX: number;
  offsetY: number;
};

const STORAGE_KEY = "portfolio-project-note-positions-v1";

const noteColors = [
  "bg-yellow-200",
  "bg-pink-200",
  "bg-cyan-200",
  "bg-lime-200",
  "bg-orange-200",
  "bg-purple-200",
];

const rotations = [-3, 2, -1, 3, -2, 1];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createDefaultPositions(
  projects: Project[],
  boardWidth: number
): Record<string, NotePosition> {
  const isMobile = boardWidth < 640;
  const result: Record<string, NotePosition> = {};

  if (isMobile) {
    const step = projects.length > 1 ? 82 / projects.length : 30;

    projects.forEach((project, index) => {
      result[project.slug] = {
        x: index % 2 === 0 ? 6 : 16,
        y: 6 + index * step,
        rotate: rotations[index % rotations.length],
      };
    });

    return result;
  }

  const columns = [6, 37, 67];
  const rows = Math.ceil(projects.length / 3);
  const yStep = rows > 1 ? 72 / rows : 30;

  projects.forEach((project, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);

    result[project.slug] = {
      x: columns[col],
      y: 8 + row * yStep + (col === 1 ? 4 : 0),
      rotate: rotations[index % rotations.length],
    };
  });

  return result;
}

function loadSavedPositions(): Record<string, NotePosition> {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function savePositions(positions: Record<string, NotePosition>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // localStorageが使えない環境では保存しない
  }
}

export default function ProjectList() {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [positions, setPositions] = useState<Record<string, NotePosition>>({});
  const [boardWidth, setBoardWidth] = useState(0);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({});
  const [zIndexCounter, setZIndexCounter] = useState(100);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.error ?? "作品データの取得に失敗しました。");
          return;
        }

        setProjects(data);
      } catch (error) {
        console.error("作品データの取得に失敗しました", error);
        setErrorMessage("通信エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const board = boardRef.current;

    if (!board) {
      return;
    }

    setBoardWidth(board.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) => {
      setBoardWidth(entry.contentRect.width);
    });

    observer.observe(board);

    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    if (projects.length === 0 || boardWidth === 0) {
      return;
    }

    const savedPositions = loadSavedPositions();
    const defaultPositions = createDefaultPositions(projects, boardWidth);

    setPositions((currentPositions) => {
      const merged: Record<string, NotePosition> = {};

      projects.forEach((project) => {
        merged[project.slug] =
          currentPositions[project.slug] ??
          savedPositions[project.slug] ??
          defaultPositions[project.slug];
      });

      return merged;
    });
  }, [projects, boardWidth]);

  const boardHeight = useMemo(() => {
    const isMobile = boardWidth < 640;
    const columns = isMobile ? 1 : 3;
    const rows = Math.ceil(Math.max(projects.length, 1) / columns);

    return Math.max(isMobile ? 900 : 720, rows * (isMobile ? 300 : 310) + 220);
  }, [projects.length, boardWidth]);

  function bringToFront(slug: string) {
    setZIndexCounter((currentCounter) => {
      const nextCounter = currentCounter + 1;

      setZIndexes((currentZIndexes) => ({
        ...currentZIndexes,
        [slug]: nextCounter,
      }));

      return nextCounter;
    });
  }

  function handlePointerDown(
    event: PointerEvent<HTMLElement>,
    slug: string
  ) {
    const board = boardRef.current;

    if (!board) {
      return;
    }

    bringToFront(slug);

    const noteRect = event.currentTarget.getBoundingClientRect();

    setDragging({
      slug,
      offsetX: event.clientX - noteRect.left,
      offsetY: event.clientY - noteRect.top,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!dragging || !boardRef.current) {
      return;
    }

    const boardRect = boardRef.current.getBoundingClientRect();

    const x =
      ((event.clientX - boardRect.left - dragging.offsetX) / boardRect.width) *
      100;

    const y =
      ((event.clientY - boardRect.top - dragging.offsetY) / boardRect.height) *
      100;

    setPositions((currentPositions) => {
      const current = currentPositions[dragging.slug];

      if (!current) {
        return currentPositions;
      }

      const nextPositions = {
        ...currentPositions,
        [dragging.slug]: {
          ...current,
          x: clamp(x, 2, boardWidth < 640 ? 34 : 78),
          y: clamp(y, 3, 86),
        },
      };

      savePositions(nextPositions);
      return nextPositions;
    });
  }

  function handlePointerUp() {
    setDragging(null);
  }

  function resetPositions() {
    const defaultPositions = createDefaultPositions(projects, boardWidth);
    setPositions(defaultPositions);
    savePositions(defaultPositions);
  }

  if (loading) {
    return (
      <div className="h-[720px] animate-pulse rounded-[2rem] bg-white/80" />
    );
  }

  if (errorMessage) {
    return <p className="text-red-300">{errorMessage}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <p className="text-sm leading-7 text-slate-300">
          制作物を付箋としてホワイトボードに貼っています。
          付箋はドラッグで自由に移動できます。
        </p>

        <button
          type="button"
          onClick={resetPositions}
          className="w-fit rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
        >
          配置をリセット
        </button>
      </div>

      <div
        ref={boardRef}
        className="relative overflow-hidden rounded-[2rem] border-8 border-slate-300 bg-white shadow-2xl"
        style={{
          height: boardHeight,
          backgroundImage:
            "linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-cyan-50" />

        <div className="pointer-events-none absolute left-6 top-5 rounded-full border border-slate-300 px-4 py-1 text-xs font-bold tracking-[0.25em] text-slate-400">
          WORKS BOARD
        </div>

        <div className="pointer-events-none absolute bottom-0 left-8 right-8 h-4 rounded-t-xl bg-slate-300" />

        {projects.map((project, index) => {
          const position = positions[project.slug];

          if (!position) {
            return null;
          }

          const color = noteColors[index % noteColors.length];
          const number = String(index + 1).padStart(2, "0");
          const isDragging = dragging?.slug === project.slug;

          return (
            <article
              key={project.slug}
              onPointerDown={(event) => handlePointerDown(event, project.slug)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute w-64 select-none rounded-sm ${color} p-5 text-slate-950 shadow-xl transition-shadow duration-200 sm:w-72 ${
                isDragging
                  ? "cursor-grabbing shadow-2xl"
                  : "cursor-grab hover:shadow-2xl"
              }`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: `rotate(${isDragging ? 0 : position.rotate}deg)`,
                zIndex: zIndexes[project.slug] ?? index + 1,
                touchAction: "none",
              }}
            >
              <div className="absolute left-1/2 top-[-10px] h-6 w-16 -translate-x-1/2 rotate-[-2deg] bg-white/50 shadow-sm" />

              <div className="mb-4 flex items-center justify-between border-b border-slate-900/20 pb-3">
                <span className="text-xs font-black tracking-[0.25em] text-slate-700">
                  NOTE {number}
                </span>
                <span className="h-3 w-3 rounded-full bg-red-400 shadow" />
              </div>

              <h3 className="text-xl font-black leading-tight">
                {project.title}
              </h3>

              <p className="mt-4 line-clamp-4 text-sm font-medium leading-7 text-slate-800">
                {project.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tech.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-slate-950/10 px-2 py-1 text-[10px] font-bold text-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <Link
                href={`/projects/${project.slug}`}
                onPointerDown={(event) => event.stopPropagation()}
                className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-500"
              >
                詳細を見る →
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}