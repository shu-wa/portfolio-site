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
  description: "集まる前も、集まった後も。イベントの連絡・予定・参加者・費用の記録をひとつに。",
  overview: "イベントのたびにグループをつくり、日時や場所を何度も送り直す。その小さな手間を減らしたくて、TSUDOWAをつくりました。招待コードでイベント単位につながり、当日の予定や会話、共有費用をまとめて確認できます。終了後の思い出を残し、同じメンバーで次のイベントへ。iOS / Androidアプリとして一般公開に向けて準備しています。",
  tech: ["iOS / Android", "モバイルアプリ", "プロダクト開発"],
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
  learnings: ["身近な不便から出発し、企画・体験設計・開発・公開準備まで、一つのプロダクトを育てています。"],
  future: ["一般公開に向けて、使いやすさと動作の確認を進めています。"],
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
