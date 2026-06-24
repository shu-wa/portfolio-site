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
        className="relative flex min-h-screen items-center overflow-hidden px-6"
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-semibold tracking-[0.5em] text-cyan-300">
            WEB / AWS / GAME / DATABASE
          </p>

          <h1 className="max-w-5xl text-5xl font-bold leading-tight md:text-7xl">
            Shuwa Tamaki&apos;s
            <br />
            Portfolio
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-200">
            Next.js、TypeScript、AWS、Java、Pythonを用いて制作したWebアプリ、
            ゲーム、データベースシステムを紹介しています。
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

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-sm tracking-[0.4em] text-slate-300">
          SCROLL
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