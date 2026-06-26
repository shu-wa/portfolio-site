import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import VerticalGuitarNeck from "./VerticalGuitarNeck";
import MobileGuitarNeck from "./MobileGuitarNeck";

export default function AboutSection() {
  return (
    <section id="about" className="relative bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl gap-10 px-4 sm:px-6">
        <VerticalGuitarNeck />

        <div className="min-w-0 flex-1">
          <section className="flex min-h-screen items-center py-24">
            <ScrollReveal direction="left" className="w-full">
              <p className="mb-4 text-sm font-semibold tracking-[0.4em] text-cyan-400">
                ABOUT ME
              </p>

              <h2 className="text-5xl font-bold leading-tight md:text-7xl">
                玉木 秀杷
              </h2>
              <h2 className="text-5xl font-bold leading-tight md:text-4xl">
                Tamaki Shuwa
              </h2>

              <p className="mt-8 max-w-3xl text-lg leading-9 text-slate-300 md:text-xl">
                芝浦工業大学デザイン工学部デザイン工学科ロボティクス・情報デザイン系<br/><br/>

                大学でプログラミング、データベース、信号処理、制御、UML設計などを学びながら、
                Java、Python、Next.js、AWSを用いた制作に取り組んでいます。
              </p>
            </ScrollReveal>
          </section>

          <section className="flex min-h-screen items-center py-24">
            <ScrollReveal direction="right" className="w-full">
              <div className="grid items-center gap-10 lg:grid-cols-[360px_1fr]">
                <div className="mx-auto h-72 w-72 overflow-hidden rounded-full border border-cyan-400/40 bg-slate-900 shadow-2xl md:h-96 md:w-96">
                  <Image
                    src="/profile.jpg"
                    alt="玉木秀杷のプロフィール写真"
                    width={500}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <p className="mb-4 text-sm font-semibold tracking-[0.4em] text-cyan-400">
                    PROFILE
                  </p>

                  <h3 className="text-4xl font-bold md:text-5xl">
                    作る理由を説明できる開発者へ
                  </h3>

                  <p className="mt-8 text-lg leading-9 text-slate-300">
                    ただ動くものを作るだけでなく、なぜその設計にしたのか、
                    どこで苦労し、どう改善したのかを説明できる開発を意識しています。
                    このポートフォリオも、静的な紹介ページではなく、AWSと連携した管理機能付きWebアプリとして構築しました。
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </section>

          <section className="flex min-h-screen items-center py-24">
                <ScrollReveal direction="left" className="w-full">
                    <p className="mb-4 text-sm font-semibold tracking-[0.4em] text-cyan-400">
                    HISTORY
                    </p>

                    <h3 className="text-4xl font-bold md:text-5xl">経歴</h3>

                    <div className="mt-8 max-w-4xl space-y-4 text-lg leading-9 text-slate-300">
                    <div className="grid grid-cols-[5rem_1fr] gap-4">
                        <span className="font-semibold text-cyan-300">2021年</span>
                        <span>東京都立多摩科学技術高校 入学</span>
                    </div>

                    <div className="grid grid-cols-[5rem_1fr] gap-4">
                        <span className="font-semibold text-cyan-300">2024年</span>
                        <span>東京都立多摩科学技術高校 卒業</span>
                    </div>

                    <div className="grid grid-cols-[5rem_1fr] gap-4">
                        <span className="font-semibold text-cyan-300">2024年</span>
                        <span>芝浦工業大学 入学</span>
                    </div>
                    </div>
                </ScrollReveal>
            </section>

          <section className="flex min-h-screen items-center py-24">
            <ScrollReveal direction="right" className="w-full">
              <p className="mb-4 text-sm font-semibold tracking-[0.4em] text-cyan-400">
                INTERESTS
              </p>

              <h3 className="text-4xl font-bold md:text-5xl">興味</h3>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {[
                  "Webアプリ開発",
                  "クラウド",
                  "データベース",
                  "ゲーム開発",
                  "UI/UX設計",
                  "認証・管理画面",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-3xl border border-slate-800 bg-slate-900 p-7"
                  >
                    <p className="text-xl font-bold text-slate-100">{item}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </section>

          <section className="relative flex min-h-screen items-center py-24">
                <div className="sticky top-20 z-20 mb-8 w-full lg:hidden">
                    <MobileGuitarNeck />
                </div>

                <ScrollReveal direction="left" className="w-full">
                    <p className="mb-4 text-sm font-semibold tracking-[0.4em] text-cyan-400">
                    HOBBY
                    </p>

                    <h3 className="text-4xl font-bold md:text-5xl">
                    趣味・好きなこと
                    </h3>

                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
                        <h4 className="mb-3 text-xl font-bold text-cyan-300">
                        Guitar
                        </h4>
                        <p className="leading-8 text-slate-300">
                        大学からギターを始めさせていただきました。
                        仲間にも恵まれて、とても充実したバンド活動が出来ています。
                        バイトで稼いだお金はほとんどこちらに消えています。
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
                        <h4 className="mb-3 text-xl font-bold text-cyan-300">
                        Soccer
                        </h4>
                        <p className="leading-8 text-slate-300">
                        小学生から高校生まで、計12年間サッカーに取り組んできました。
                        大変なこともありましたが、今では自分を形作った大切な経験だと感じています。
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
                        <h4 className="mb-3 text-xl font-bold text-cyan-300">
                        Video Game
                        </h4>
                        <p className="leading-8 text-slate-300">
                        FPSからサンドボックスまで、幅広いジャンルのゲームを遊んできました。
                        ゲームのUIや体験設計にも興味を持つきっかけになっています。
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
                        <h4 className="mb-3 text-xl font-bold text-cyan-300">
                        Snowboard
                        </h4>
                        <p className="leading-8 text-slate-300">
                        両親の影響で、幼いころから毎年滑りに行っています。
                        スキーもできますが、個人的にはスノーボードの方が楽しく感じます。
                        </p>
                    </div>
                    </div>

                    <p className="mt-8 max-w-4xl text-lg leading-9 text-slate-300">
                    趣味の中でも特にハマっているのがギターです。
                    PC表示では左側に縦型のギターネックを、スマホ表示ではこのセクション上部に
                    横向きのギターネックを表示し、クリックすると音が鳴るようにしています。
                    </p>
                </ScrollReveal>
            </section>

          
        </div>
      </div>
    </section>
  );
}