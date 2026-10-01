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
    { label: "WHAT IT DOES", title: "できること", items: project.features },
    { label: "TRIAL & ERROR", title: "試して、直したこと", items: project.problems },
    { label: "TAKEAWAYS", title: "この制作から", items: project.learnings },
    { label: "WHAT'S NEXT", title: "次に向けて", items: project.future },
  ];
  const embed = youtubeEmbed(project.demoVideoUrl ?? "");
  return <><SiteHeader /><main id="main-content" className="detail-main">
    <section className="section-pad detail-intro"><Link href="/#projects" className="back-link"><ArrowLeft size={17} />制作物一覧へ</Link>
      <p className="mono">SELECTED EXPLORATION / {product ? "MOBILE APP" : "FIELD NOTES"}</p>
      <h1 className="detail-title">{project.title}</h1><p className="detail-description">{project.description}</p>
      {product && <span className="product-note">一般公開に向けて準備中</span>}
      <div className="work-tech">{project.tech.map((tech) => <span key={tech}>{tech}</span>)}</div>
      <div className="detail-links">{[{ url: project.githubUrl, label: "GitHub" }, { url: project.demoUrl, label: "デモを開く" }].filter((link) => link.url).map((link) => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="action-link">{link.label}<ArrowUpRight size={18} /></a>)}</div>
    </section>
    <div className="section-pad" style={{ paddingTop: 0 }}>
      <section className="detail-overview"><h2>はじまりと、形。</h2><p>{project.overview}</p></section>
      {(project.screenshotUrls?.length || project.demoVideoUrl) ? <section className="detail-section"><span className="mono">A CLOSER LOOK</span><h2>画面と体験</h2>
        {project.demoVideoUrl && (embed ? <iframe className="detail-video" src={embed} title={`${project.title} デモ映像`} allow="fullscreen; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <video className="detail-video" src={project.demoVideoUrl} controls preload="metadata" />)}
        <div className={`detail-media ${product ? "mobile-media" : ""}`}>{project.screenshotUrls?.map((url, index) => <a href={url} target="_blank" rel="noopener noreferrer" key={`${url}-${index}`} aria-label={`${project.title} 画面${index + 1}を原寸で開く`}><img src={url} alt={`${project.title}の画面 ${index + 1}`} width={product ? 1179 : undefined} height={product ? 2556 : undefined} loading="lazy" /></a>)}</div>
        {product && <p className="media-note">開発中の画面です。一般公開版では表示が変わる場合があります。</p>}
      </section> : null}
      {sections.filter((section) => section.items.length).map((section) => <section className="detail-section" key={section.label}><span className="mono">{section.label}</span><h2>{section.title}</h2><ul>{section.items.map((item, index) => <li key={index}>{item}</li>)}</ul></section>)}
      {project.designDecisions.length > 0 && <section className="detail-section"><span className="mono">THOUGHT BEHIND THE WORK</span><h2>設計の工夫</h2>{project.designDecisions.map((decision, index) => <article className="decision" key={index}><h3>{decision.title}</h3><dl>{[{ title: "何をしたか", text: decision.what }, { title: "なぜそうしたか", text: decision.why }, { title: "どう変わったか", text: decision.effect }].map((item) => <div key={item.title}><dt>{item.title}</dt><dd>{item.text}</dd></div>)}</dl></article>)}</section>}
    </div>
  </main><footer className="site-footer"><Link className="brand" href="/">ST<span className="brand-plus">+</span></Link><Link href="/#projects" className="mono">BACK TO WORKS <ArrowUpRight size={16} /></Link></footer></>;
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
