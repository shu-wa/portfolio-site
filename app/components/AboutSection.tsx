import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function AboutSection() {
  return <section id="about" className="about-section section-pad">
    <div className="section-heading"><span className="mono">03 / プロフィール</span><span className="mono">ABOUT ME</span></div>
    <div className="about-grid">
      <div className="portrait" data-reveal><Image src="/profile.jpg" alt="玉木秀杷" width={1108} height={1477} sizes="(max-width: 760px) 100vw, 42vw" /><span className="portrait-caption mono">SHUWA TAMAKI / JAPAN</span></div>
      <div className="about-copy" data-reveal>
        <p className="mono">HELLO, I&apos;M</p><h2>玉木 秀杷<span>Shuwa Tamaki</span></h2>
        <p className="about-intro">気になるものが、<br />ひとつに収まらない。</p>
        <p>芝浦工業大学 デザイン工学部で、ロボティクス・情報デザインを学んでいます。アプリ、ゲーム、データベース、Web。分野を決める前に、まず触ってみる。その積み重ねが、わたしの強みです。</p>
        <p>大学から始めたギターも、12年間続けたサッカーも。初めてのことに飛び込んで、仲間と試行錯誤する時間が好きです。</p>
        <div className="history"><div><span className="mono">2021</span><span>多摩科学技術高校 入学</span></div><div><span className="mono">2024</span><span>芝浦工業大学 入学</span></div><div><span className="mono">NOW</span><span>好奇心を、制作物に。<ArrowUpRight size={17} /></span></div></div>
      </div>
    </div>
  </section>;
}
