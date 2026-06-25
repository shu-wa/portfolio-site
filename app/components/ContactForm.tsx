"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data.error ?? "送信に失敗しました。");
        return;
      }

      setName("");
      setEmail("");
      setMessage("");
      setStatusMessage("メッセージを送信しました。ありがとうございます！");
    } catch (error) {
      console.error("お問い合わせ送信エラー", error);
      setStatusMessage("通信エラーが発生しました。");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <form
        onSubmit={handleSubmit}
        className="relative rotate-[-1deg] rounded-sm bg-yellow-100 p-6 text-slate-950 shadow-2xl md:p-8"
      >
        <div className="absolute left-1/2 top-[-12px] h-7 w-28 -translate-x-1/2 rotate-2 bg-white/60 shadow-sm" />

        <div className="mb-8 border-b-2 border-slate-900/20 pb-5">
          <p className="mb-3 text-xs font-black tracking-[0.35em] text-slate-600">
            MESSAGE CARD
          </p>

          <h3 className="text-3xl font-black md:text-4xl">
            Send me a message
          </h3>

          <p className="mt-3 text-sm font-bold leading-7 text-slate-700">
            ご連絡・ご質問などがあれば、こちらから送信できます。
          </p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-xl border-2 border-slate-900/20 bg-white/70 px-4 py-3 font-bold outline-none transition focus:border-cyan-500"
              placeholder="お名前"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border-2 border-slate-900/20 bg-white/70 px-4 py-3 font-bold outline-none transition focus:border-cyan-500"
              placeholder="example@email.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              Message
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              rows={6}
              className="w-full resize-none rounded-xl border-2 border-slate-900/20 bg-white/70 px-4 py-3 font-bold leading-7 outline-none transition focus:border-cyan-500"
              placeholder="メッセージを入力してください"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="mt-8 w-full rounded-full bg-slate-950 px-6 py-4 font-black text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {isSending ? "送信中..." : "ポストに投函する →"}
        </button>

        {statusMessage && (
          <p className="mt-5 rounded-xl bg-white/70 px-4 py-3 text-sm font-bold text-slate-800">
            {statusMessage}
          </p>
        )}
      </form>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative rounded-[2rem] border border-white/10 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-8 rounded-2xl border-4 border-slate-700 bg-black p-4">
            <div className="h-4 rounded-full bg-slate-700" />
          </div>

          <div className="rounded-3xl bg-slate-950 p-8 text-center shadow-inner">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyan-300 text-5xl">
              ✉
            </div>

            <p className="text-xs font-black tracking-[0.4em] text-cyan-300">
              CONTACT BOX
            </p>

            <h3 className="mt-4 text-3xl font-black text-white">
              Thank you
            </h3>

            <p className="mt-5 text-sm font-medium leading-7 text-slate-400">
              送信されたメッセージはDynamoDBに保存され、管理画面から確認できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}