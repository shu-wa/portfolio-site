import ContactForm from "./components/ContactForm";
import ProjectList from "./components/ProjectList";

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
            href="https://github.com/shu-wa"
            className="rounded-xl border border-slate-600 px-5 py-3 font-semibold transition hover:bg-slate-800"
          >
            GitHub
          </a>
        </div>

        <section id="projects">
          <h2 className="mb-6 text-2xl font-bold">Projects</h2>
          <ProjectList />
        </section>

        <section id="architecture" className="mt-20">
          <h2 className="mb-6 text-2xl font-bold">System Architecture</h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="mb-6 leading-7 text-slate-300">
              このポートフォリオサイトは、Next.jsで画面とAPIを実装し、
              AWS Amplify Hostingで公開しています。お問い合わせ内容は
              DynamoDBに保存し、管理画面ではCognito認証を通じて
              保存されたお問い合わせ一覧を確認できるようにしています。
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-950 p-4">
                <h3 className="mb-2 font-bold text-cyan-300">Frontend</h3>
                <p className="text-sm leading-6 text-slate-300">
                  Next.js、TypeScript、Tailwind CSSを用いて、作品一覧、
                  作品詳細、お問い合わせフォーム、管理画面を実装しています。
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <h3 className="mb-2 font-bold text-cyan-300">Backend API</h3>
                <p className="text-sm leading-6 text-slate-300">
                  Next.js API Routeを用いて、作品情報取得API、
                  お問い合わせ送信API、お問い合わせ一覧取得APIを実装しています。
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <h3 className="mb-2 font-bold text-cyan-300">AWS</h3>
                <p className="text-sm leading-6 text-slate-300">
                  AWS Amplify Hostingで公開し、DynamoDBにお問い合わせ内容を保存しています。
                  IAMロールを用いて安全にAWSリソースへアクセスしています。
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <h3 className="mb-2 font-bold text-cyan-300">Authentication</h3>
                <p className="text-sm leading-6 text-slate-300">
                  Amazon Cognitoを用いて管理画面のログイン機能を実装し、
                  管理者のみが問い合わせ一覧を確認できるようにしています。
                </p>
              </div>
            </div>
          </div>
        </section>


        <section id="contact" className="mt-20">
          <h2 className="mb-6 text-2xl font-bold">Contact</h2>
          <ContactForm />
        </section>
      </section>
    </main>
  );
}