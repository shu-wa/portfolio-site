import Image from "next/image";
import GuitarNeck from "./GuitarNeck";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-24 text-white"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="animate-[slideInLeft_0.9s_ease-out_both]">
          <p className="mb-3 text-sm font-semibold tracking-[0.4em] text-cyan-400">
            ABOUT ME
          </p>

          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            玉木 秀杷
          </h2>

          <div className="space-y-5 leading-8 text-slate-300">
            <p>
              大学でプログラミング、データベース、信号処理、制御、UML設計などを学びながら、
              Java、Python、Next.js、AWSを用いた制作に取り組んでいます。
            </p>

            <p>
              単に動くものを作るだけでなく、なぜその設計にしたのか、
              どのように改善したのかを説明できる開発を意識しています。
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="mb-2 font-bold text-cyan-300">興味</h3>
              <p className="text-sm leading-7 text-slate-300">
                Webアプリ開発、クラウド、データベース、ゲーム開発、UI/UX設計
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="mb-2 font-bold text-cyan-300">趣味</h3>
              <p className="text-sm leading-7 text-slate-300">
                ギター、ゲーム、音楽、ものづくり
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:col-span-2">
              <h3 className="mb-2 font-bold text-cyan-300">経歴</h3>
              <p className="text-sm leading-7 text-slate-300">
                大学で情報系科目を学習しながら、JavaとMySQLを用いた飲食店注文・在庫管理システム、
                Python/Pyxelによるゲーム、Next.jsとAWSを用いたポートフォリオサイトを制作しています。
              </p>
            </div>
          </div>
        </div>

        <div className="animate-[slideInRight_0.9s_ease-out_both]">
          <div className="mx-auto mb-8 h-72 w-72 overflow-hidden rounded-full border border-cyan-400/40 bg-slate-900 shadow-2xl md:h-96 md:w-96">
            <Image
              src="/profile.jpg"
              alt="玉木秀杷のプロフィール写真"
              width={500}
              height={500}
              className="h-full w-full object-cover"
            />
          </div>

          <GuitarNeck />
        </div>
      </div>
    </section>
  );
}