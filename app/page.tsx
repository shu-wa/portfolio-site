import Link from "next/link";
import { ArrowUpRight, LogIn } from "lucide-react";
import AboutSection from "./components/AboutSection";
import ContactForm from "./components/ContactForm";
import ProjectList from "./components/ProjectList";
import SiteHeader from "./components/SiteHeader";
import PortfolioMotion from "./components/PortfolioMotion";
import CuriosityHero from "./components/CuriosityHero";
import { getPublicProjects } from "../lib/projects";
import { personalStrengths } from "../data/profile";

export default async function Home() {
  const projects = await getPublicProjects();
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
          <div className="mindset-statement" data-reveal><h2>私の強み</h2></div>
          <div className="strength-list">{personalStrengths.map(({ title, description }) => <article className="strength-item" key={title} data-reveal><h3>{title}</h3><p>{description}</p></article>)}</div>
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
