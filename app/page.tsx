const projects = [
  {
    title: "飲食店注文・在庫管理システム",
    description:
      "JavaとMySQLを用いて、店舗選択、メニュー検索、注文、在庫管理、売上確認を行えるCLIシステムを作成しました。",
    tech: ["Java", "MySQL", "JDBC"],
  },
  {
    title: "マインスイーパーRPG",
    description:
      "Pyxelを用いて、マインスイーパーにHP・敵の攻撃・旗による防御要素を追加したゲームを作成しました。",
    tech: ["Python", "Pyxel"],
  },
  {
    title: "8パズル自動解法",
    description:
      "Pythonで8パズルを実装し、BFSによる自動解法機能を追加しました。",
    tech: ["Python", "アルゴリズム"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-semibold text-cyan-400">
          Portfolio Site
        </p>

        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
          玉木秀杷の
          <br />
          ポートフォリオ
        </h1>

        <p className="mb-8 max-w-3.5xl text-lg leading-8 text-slate-300">
          Java、SQL、Pythonを中心に、Webアプリケーションやゲーム制作を通して、設計・実装・改善を学んでいます。<br/>
          今後はAWSやAPI連携を取り入れたWebポートフォリオとして拡張していきます。
        </p>

        <div className="mb-14 flex gap-4">
          <a
            href="#projects"
            className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            制作物を見る
          </a>
          <a
            href="https://github.com/"
            className="rounded-xl border border-slate-600 px-5 py-3 font-semibold transition hover:bg-slate-800"
          >
            GitHub
          </a>
        </div>

        <section id="projects">
          <h2 className="mb-6 text-2xl font-bold">Projects</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <h3 className="mb-3 text-xl font-bold">{project.title}</h3>
                <p className="mb-4 text-sm leading-6 text-slate-300">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-slate-800 px-3 py-1 text-xs text-cyan-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}