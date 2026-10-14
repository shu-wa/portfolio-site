import Image from "next/image";
import { ArrowUpRight, GitBranch } from "lucide-react";
import { profileDetails } from "../../data/profile";

export default function AboutSection() {
  return <section id="about" className="about-section section-pad">
    <div className="section-heading"><h2>プロフィール</h2></div>
    <div className="about-grid">
      <div className="portrait" data-reveal><Image src="/profile.jpg" alt="玉木秀杷" width={1108} height={1477} sizes="(max-width: 760px) 100vw, 42vw" /></div>
      <div className="about-copy" data-reveal>
        <h3>玉木 秀杷<span>Shuwa Tamaki</span></h3>
        <p>芝浦工業大学 デザイン工学部で、ロボティクス・情報デザインを学んでいます。AIも使いながら、アプリやゲームを制作しています。</p>
        <p>{profileDetails.aspiration}</p>
        <p>サッカー歴は12年。ギターは大学から始めました。</p>
        <dl className="profile-facts">{[
          { label: "関心", value: profileDetails.interests },
          { label: "開発経験", value: profileDetails.webExperience },
          { label: "UX調査", value: profileDetails.uxMethods },
        ].map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <h4>チームでの経験</h4><p>{profileDetails.teamExperience}</p>
        <div className="profile-links"><a className="action-link github-profile-link" href="https://github.com/shu-wa" target="_blank" rel="noopener noreferrer"><GitBranch size={20} aria-hidden="true" /><span>GitHub</span><ArrowUpRight size={18} aria-hidden="true" /></a></div>
        <div className="history"><div><span className="mono">2021</span><span>多摩科学技術高校 入学</span></div><div><span className="mono">2024</span><span>芝浦工業大学 入学</span></div></div>
      </div>
    </div>
  </section>;
}
