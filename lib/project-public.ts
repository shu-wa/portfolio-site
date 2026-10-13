import type { Project } from "../types/project";

export function isTsudowa(project: Pick<Project, "slug" | "title">) {
  return /tsudowa|do-eventer|doeventer|ツドワ/i.test(`${project.slug} ${project.title}`);
}

export function safeUrl(value: unknown, local = false): string {
  if (typeof value !== "string" || /[\u0000-\u0020\\]/.test(value)) return "";
  if (local && /^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export const tsudowaPublic: Project = {
  slug: "tsudowa",
  title: "TSUDOWA",
  description: "イベントの予定、連絡、出欠、費用をまとめるアプリ。",
  overview: "イベントのたびにグループをつくり、日時や場所を送り直す手間を減らすために制作しました。招待コードで参加し、予定・連絡・共有費用をイベントごとに確認できます。",
  tech: ["iOS / Android"],
  features: [
    "招待コードで、友だち登録をせずにイベントへ参加。",
    "日時・集合場所・当日の予定をひとつに整理。",
    "出欠回答と候補日の投票で、日程を調整。",
    "イベントごとのチャットで、連絡や写真を共有。",
    "共有費用と支払状況を記録。実際の送金・決済は行いません。",
    "終了したイベントを思い出として保存し、次の集まりへ。",
  ],
  screenshotUrls: ["/do-eventer-demo.png", "/do-eventer-demo2.png", "/do-eventer-demo3.png"],
  designDecisions: [],
  problems: [],
  learnings: [],
  future: [],
  order: 1,
};

// Public routes use an explicit projection; stored admin data never becomes public by default.
export function toPublicProject(project: Project): Project {
  if (isTsudowa(project)) {
    return { ...tsudowaPublic, slug: project.slug, order: project.order ?? 1 };
  }
  const strings = (value: unknown) => Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string") : [];
  return {
    slug: project.slug,
    title: project.title,
    description: project.description,
    overview: project.overview ?? "",
    tech: strings(project.tech),
    features: strings(project.features),
    designDecisions: Array.isArray(project.designDecisions) ? project.designDecisions.filter((item) => item && typeof item === "object").map((item) => ({
      title: String(item.title ?? ""), what: String(item.what ?? ""),
      why: String(item.why ?? ""), effect: String(item.effect ?? ""),
    })) : [],
    problems: strings(project.problems), learnings: strings(project.learnings), future: strings(project.future),
    screenshotUrls: strings(project.screenshotUrls).map((url) => safeUrl(url, true)).filter(Boolean),
    demoVideoUrl: safeUrl(project.demoVideoUrl, true),
    demoUrl: safeUrl(project.demoUrl), githubUrl: safeUrl(project.githubUrl),
    order: project.order,
  };
}

export function publicProjectList(projects: Project[]) {
  const source = projects.some(isTsudowa) ? projects : [tsudowaPublic, ...projects];
  return source.map(toPublicProject).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}
