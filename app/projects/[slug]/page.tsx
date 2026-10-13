/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import { getStoredProject } from "../../../lib/projects";
import { isTsudowa, toPublicProject } from "../../../lib/project-public";
import { validSlug } from "../../../lib/project-input";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!validSlug(slug)) return { title: "Not Found" };
  const stored = await getStoredProject(slug);
  if (!stored) return { title: "Not Found" };
  const project = toPublicProject(stored);
  return { title: project.title, description: project.description };
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  if (!validSlug(slug)) notFound();
  const stored = await getStoredProject(slug);
  if (!stored) notFound();
  const project = toPublicProject(stored);
  const product = isTsudowa(project);
  const sections = [
    { title: "主な機能", items: project.features },
    { title: "修正した点", items: project.problems },
    { title: "学んだこと", items: project.learnings },
    { title: "今後", items: project.future },
  ];
  const embed = youtubeEmbed(project.demoVideoUrl ?? "");
  const links = [{ url: project.githubUrl, label: "GitHub" }, { url: project.demoUrl, label: "デモを開く" }].filter((link) => link.url);
  return <><SiteHeader /><main id="main-content" className="detail-main">
    <section className="section-pad detail-intro"><Link href="/#projects" className="back-link"><ArrowLeft size={17} />制作物一覧へ</Link>
      <h1 className="detail-title">{project.title}</h1><p className="detail-description">{project.description}</p>
      {product && <span className="product-note">公開準備中</span>}
      <div className="work-tech">{project.tech.map((tech) => <span key={tech}>{tech}</span>)}</div>
      {links.length > 0 && <div className="detail-links">{links.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="action-link">{link.label}<ArrowUpRight size={18} /></a>)}</div>}
    </section>
    <div className="section-pad" style={{ paddingTop: 0 }}>
      {project.overview && <section className="detail-overview"><h2>概要</h2><p>{project.overview}</p></section>}
      {(project.screenshotUrls?.length || project.demoVideoUrl) ? <section className="detail-section"><h2>画面</h2>
        {project.demoVideoUrl && (embed ? <iframe className="detail-video" src={embed} title={`${project.title} デモ映像`} allow="fullscreen; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <video className="detail-video" src={project.demoVideoUrl} controls preload="metadata" />)}
        <div className={`detail-media ${product ? "mobile-media" : ""}`}>{project.screenshotUrls?.map((url, index) => <a href={url} target="_blank" rel="noopener noreferrer" key={`${url}-${index}`} aria-label={`${project.title} 画面${index + 1}を原寸で開く`}><img src={url} alt={`${project.title}の画面 ${index + 1}`} width={product ? 1179 : undefined} height={product ? 2556 : undefined} loading="lazy" /></a>)}</div>
      </section> : null}
      {sections.filter((section) => section.items.length).map((section) => <section className="detail-section" key={section.title}><h2>{section.title}</h2><ul>{section.items.map((item, index) => <li key={index}>{item}</li>)}</ul></section>)}
      {project.designDecisions.length > 0 && <section className="detail-section"><h2>設計の工夫</h2>{project.designDecisions.map((decision, index) => <article className="decision" key={index}><h3>{decision.title}</h3><dl>{[{ title: "何をしたか", text: decision.what }, { title: "なぜそうしたか", text: decision.why }, { title: "どう変わったか", text: decision.effect }].map((item) => <div key={item.title}><dt>{item.title}</dt><dd>{item.text}</dd></div>)}</dl></article>)}</section>}
    </div>
  </main><footer className="site-footer"><Link className="brand" href="/">ST<span className="brand-plus">+</span></Link><Link href="/#projects" className="mono">制作物一覧へ <ArrowUpRight size={16} /></Link></footer></>;
}

function youtubeEmbed(value: string) {
  try {
    const url = new URL(value);
    const hosts = ["www.youtube.com", "youtube.com", "m.youtube.com", "youtu.be"];
    if (!hosts.includes(url.hostname)) return "";
    const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v");
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : "";
  } catch { return ""; }
}
