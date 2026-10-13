import type { Metadata } from "next";
import { connection } from "next/server";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://main.d217a718xi2gst.amplifyapp.com"),
  title: { default: "玉木秀杷 | とりあえずなんでもやってみる！！", template: "%s | Shuwa Tamaki" },
  description: "玉木秀杷のポートフォリオ。アプリ、ゲーム、Web、業務システムの制作物を掲載しています。",
  openGraph: { title: "玉木秀杷 | ポートフォリオ", description: "アプリ、ゲーム、Web、業務システムの制作物。", images: [{ url: "/profile.jpg", width: 1108, height: 1477, alt: "玉木秀杷" }], locale: "ja_JP", type: "website" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <a className="skip-link" href="#main-content">本文へ移動</a>
        {children}
      </body>
    </html>
  );
}
