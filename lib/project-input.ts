import type { DesignDecision, Project } from "../types/project";
import { HttpError } from "./security";
import { safeUrl } from "./project-public";

export function validSlug(value: string) { return /^[a-z0-9][a-z0-9-]{0,79}$/.test(value); }

export function parseProject(value: unknown): Project {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HttpError(400, "作品データを確認してください。");
  const input = value as Record<string, unknown>;
  function text(key: string, max = 12000, required = false) {
    const value = input[key] ?? "";
    if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new HttpError(400, `${key}を確認してください。`);
    return value.trim();
  }
  function list(key: string) {
    const value = input[key] ?? [];
    if (!Array.isArray(value) || value.length > 40 || value.some((item) => typeof item !== "string" || item.length > 6000)) throw new HttpError(400, `${key}を確認してください。`);
    return value as string[];
  }
  function url(key: string, local = false) {
    const value = text(key, 2048);
    const safe = safeUrl(value, local);
    if (value && !safe) throw new HttpError(400, `${key}にはHTTPSのURLまたはサイト内のパスを指定してください。`);
    return safe;
  }
  const slug = text("slug", 80, true);
  if (!validSlug(slug)) throw new HttpError(400, "slugは英小文字・数字・ハイフンで指定してください。");
  const decisions = input.designDecisions ?? [];
  if (!Array.isArray(decisions) || decisions.length > 30) throw new HttpError(400, "設計データを確認してください。");
  const designDecisions: DesignDecision[] = decisions.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new HttpError(400, "設計データを確認してください。");
    const out = {} as DesignDecision;
    for (const key of ["title", "what", "why", "effect"] as const) {
      const value = item[key] ?? "";
      if (typeof value !== "string" || value.length > 6000) throw new HttpError(400, "設計データを確認してください。");
      out[key] = value;
    }
    return out;
  });
  const screenshots = list("screenshotUrls").map((value) => {
    const url = safeUrl(value, true);
    if (!url) throw new HttpError(400, "画像URLを確認してください。");
    return url;
  });
  if (input.order !== undefined && (!Number.isSafeInteger(input.order) || Number(input.order) < 1 || Number(input.order) > 10000)) throw new HttpError(400, "表示順を確認してください。");
  return {
    slug, title: text("title", 160, true), description: text("description", 2000, true), overview: text("overview"),
    tech: list("tech"), features: list("features"), problems: list("problems"), learnings: list("learnings"), future: list("future"),
    designDecisions, screenshotUrls: screenshots, demoVideoUrl: url("demoVideoUrl", true), demoUrl: url("demoUrl"), githubUrl: url("githubUrl"),
    order: input.order as number | undefined,
  };
}
