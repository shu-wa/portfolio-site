import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Asterisk, LogIn, MoveDown } from "lucide-react";
import AboutSection from "./components/AboutSection";
import ContactForm from "./components/ContactForm";
import ProjectList from "./components/ProjectList";
import SiteHeader from "./components/SiteHeader";
import PortfolioMotion from "./components/PortfolioMotion";
import { getPublicProjects } from "../lib/projects";

export default async function Home() {
  const projects = await getPublicProjects();
  return <>
    <SiteHeader /><PortfolioMotion />
    <main id="main-content">
      <section id="top" className="hero">
        <Image className="hero-image" src="/curiosity-workbench.webp" alt="ゲームコントローラー、回路、ギターピックなど、好奇心を表す実験道具" fill preload sizes="100vw" />
        <div className="hero-content"><div className="hero-intro"><span className="mono">SHUWA TAMAKI</span><span className="mono">PORTFOLIO / APPS, GAMES &amp; WEB</span></div>
          <h1><span>とりあえず、</span><span>なんでも</span><span>やってみる<span className="hero-exclaim">!!</span></span></h1>
          <div className="hero-bottom"><p>アプリ・ゲーム・Webをつくる。<br />玉木秀杷のポートフォリオです。</p><a className="round-link" href="#projects" aria-label="制作物一覧へ"><ArrowDownRight size={29} /></a></div>
        </div>
        <div className="hero-foot"><span className="mono">好奇心を、動くものに。</span><a href="#projects" className="scroll-label mono">制作物を見る<MoveDown size={17} /></a></div>
      </section>
      <div className="ticker" aria-hidden="true"><div>{[0, 1, 2, 3].map((i) => <span key={i}>TRY SOMETHING NEW <Asterisk /> MAKE SOMETHING REAL <Asterisk /></span>)}</div></div>
      <section id="projects" className="works-section section-pad">
        <div className="section-heading"><span className="mono">01 / WORKS</span><span className="mono">APPS, GAMES &amp; WEB</span></div>
        <div className="section-title" data-reveal><h2>制作物一覧</h2><p>アプリ、ゲーム、Web、業務システム。<br />課題やアイデアを、実際に動く形にした制作物です。</p></div>
        <ProjectList projects={projects} />
      </section>
      <section id="mindset" className="mindset-section section-pad">
        <div className="section-heading"><span className="mono">02 / 私の強み</span><Asterisk size={29} /></div>
        <div className="mindset-statement" data-reveal><p className="mono">好奇心から、行動へ。</p><h2>「できるかな」を、<br /><span>「やってみた」に。</span></h2><p>AIのある今は、気になるものに手を出すのにうってつけ。<br />小さく試して、仕組みを理解して、自分の形にする。<br />つくる速さだけでなく、考え直せる柔軟さを大切にしています。</p></div>
        <div className="principles">{[{ n: "01", title: "気になる", en: "STAY CURIOUS", text: "身近な不便も、遊びのひらめきも。分野を決めつけず、まず問いを持つ。" }, { n: "02", title: "試してみる", en: "START SMALL", text: "AIも道具のひとつ。小さく動くものをつくり、自分の手で確かめる。" }, { n: "03", title: "つくり続ける", en: "MAKE IT BETTER", text: "使う人の目線に戻って、直す。試行錯誤まで含めて、ひとつの制作。" }].map((item) => <div key={item.n} data-reveal><span className="mono">{item.n} / {item.en}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
      </section>
      <AboutSection />
      <section id="contact" className="contact-section section-pad">
        <div className="section-heading"><span className="mono">04 / CONTACT</span><span className="mono">NEW CONNECTIONS, NEW POSSIBILITIES.</span></div>
        <div className="contact-title" data-reveal><h2>お問い合わせ<ArrowUpRight aria-hidden="true" /></h2><p>お仕事のお話も、アイデアの相談も。<br />新しいきっかけを、お待ちしています。</p></div><ContactForm />
      </section>
    </main>
    <footer className="site-footer"><a className="brand" href="#top">ST<span className="brand-plus">+</span></a><span className="mono">© 2026 SHUWA TAMAKI</span><Link href="/admin" prefetch={false} className="mono"><LogIn size={16} />管理者ログイン</Link><a href="#top" className="mono">トップへ <ArrowUpRight size={16} /></a></footer>
  </>;
}
