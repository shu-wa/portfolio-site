import Link from "next/link";
import { ArrowUpRight, LogIn } from "lucide-react";
import AboutSection from "./components/AboutSection";
import ContactForm from "./components/ContactForm";
import ProjectList from "./components/ProjectList";
import SiteHeader from "./components/SiteHeader";
import PortfolioMotion from "./components/PortfolioMotion";
import CuriosityHero from "./components/CuriosityHero";
import { getPublicProjects } from "../lib/projects";
import { isTsudowa } from "../lib/project-public";

export default async function Home() {
  const projects = await getPublicProjects();
  const examples = [
    { project: projects.find(isTsudowa), text: "イベントの招待、予定、連絡をまとめるアプリ。" },
    { project: projects.find((project) => project.slug === "minesweeper-rpg"), text: "マインスイーパーにHPと敵の攻撃を組み合わせたゲーム。" },
    { project: projects.find((project) => project.slug === "restaurant-order-system"), text: "JavaとMySQLで、注文・在庫・売上を管理。" },
  ].flatMap(({ project, text }) => project ? [{ project, text }] : []);
  return <>
    <SiteHeader /><PortfolioMotion />
    <main id="main-content">
      <CuriosityHero />
      <section id="projects" className="works-section section-pad">
        <div className="section-title" data-reveal><h2>制作物一覧</h2></div>
        <ProjectList projects={projects} />
      </section>
      <section id="mindset" className="mindset-section section-pad">
        <div className="mindset-grid">
          <div className="mindset-statement" data-reveal><h2>私の強み</h2><p>新しい分野でも、小さく試して形にすること。<br />アプリ、ゲーム、データベースまで、制作ごとに必要な技術を学んできました。</p></div>
          <div className="evidence-list">{examples.map(({ project, text }) => <Link className="evidence-link" key={project.slug} href={`/projects/${encodeURIComponent(project.slug)}`}><div><h3>{project.title}</h3><p>{text}</p></div><ArrowUpRight size={22} aria-hidden="true" /></Link>)}</div>
        </div>
      </section>
      <AboutSection />
      <section id="contact" className="contact-section section-pad">
        <div className="contact-title" data-reveal><h2>お問い合わせ</h2></div><ContactForm />
      </section>
    </main>
    <footer className="site-footer"><a className="brand" href="#top">ST<span className="brand-plus">+</span></a><span className="mono">© 2026 SHUWA TAMAKI</span><Link href="/admin" prefetch={false} className="mono"><LogIn size={16} />管理者ログイン</Link><a href="#top" className="mono">トップへ <ArrowUpRight size={16} /></a></footer>
  </>;
}
