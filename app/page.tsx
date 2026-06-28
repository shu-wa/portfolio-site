import AboutSection from "./components/AboutSection";
import ContactForm from "./components/ContactForm";
import ProjectList from "./components/ProjectList";
import SiteHeader from "./components/SiteHeader";
import SplashScreen from "./components/SplashScreen";

export default function Home() {
  return (
    <main className="bg-slate-950 text-white">
      <SplashScreen />
      <SiteHeader />

      <section
        id="top"
        className="relative flex min-h-screen items-end overflow-hidden px-6 pb-24 pt-32 md:px-12 md:pb-28"
      >
        <video
          className="absolute inset-0 h-full w-full animate-[heroFadeIn_3.2s_ease-out_both] object-cover"
          src="/hero.MP4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/20" />

        <div className="relative z-10 max-w-6xl">
          <p className="mb-5 text-xs font-semibold tracking-[0.55em] text-cyan-300 md:text-sm">
            WEB / AWS / GAME / DATABASE
          </p>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">
            Shuwa
            <br />
            Tamaki&apos;s
            <br />
            Portfolio
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
            Next.js、TypeScript、AWS、Javaを用いて制作したPortfolioサイトです。<br/>
            自己紹介、制作した作品の紹介を行っています。<br/>
            お問い合わせにつきましては画面最下部にあるContactからお願いします。
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              View Works
            </a>

            <a
              href="#about"
              className="rounded-full border border-white/40 px-6 py-3 font-bold text-white transition hover:bg-white hover:text-black"
            >
              About Me
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 right-6 z-10 text-xs tracking-[0.4em] text-slate-300 md:right-12">
          <span className="inline-block animate-bounce">SCROLL</span>
        </div>
      </section>

      

      <AboutSection />

      <section id="projects" className="bg-slate-950 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-semibold tracking-[0.4em] text-cyan-400">
            WORKS
          </p>
          <h2 className="mb-8 text-4xl font-bold">制作物一覧</h2>
          <ProjectList />
        </div>
      </section>

      <section id="contact" className="bg-slate-950 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-sm font-semibold tracking-[0.4em] text-cyan-400">
            CONTACT
          </p>
          <h2 className="mb-8 text-4xl font-bold">Contact</h2>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}