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
      setStatusMessage("メッセージを送信しました。ありがとうございます。");
    } catch (error) {
      console.error("お問い合わせ送信エラー", error);
      setStatusMessage("通信エラーが発生しました。");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10">
        
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          ご連絡・ご質問などがあれば、こちらのフォームから送信できます。
        </p>
      </div>

      <div className="relative rounded-[2rem] bg-slate-200 p-3 shadow-2xl md:p-5">
        <div className="rounded-[1.5rem] border border-slate-300 bg-white p-6 text-slate-950 md:p-10">
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.35em] text-slate-400">
                MESSAGE SHEET
              </p>

              <h3 className="mt-3 text-3xl font-black md:text-4xl">
                Contact Form
              </h3>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Portfolio / Inquiry
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full border-b-2 border-slate-300 bg-transparent px-1 py-3 font-semibold outline-none transition focus:border-cyan-500"
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
                  className="w-full border-b-2 border-slate-300 bg-transparent px-1 py-3 font-semibold outline-none transition focus:border-cyan-500"
                  placeholder="example@email.com"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Message
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                rows={7}
                className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 font-semibold leading-7 outline-none transition focus:border-cyan-500 focus:bg-white"
                placeholder="メッセージを入力してください"
              />
            </label>

            <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-semibold text-slate-500">
                送信内容は管理画面から確認できます。
              </p>

              <button
                type="submit"
                disabled={isSending}
                className="rounded-full bg-slate-950 px-7 py-3 font-black text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {isSending ? "送信中..." : "Send Message"}
              </button>
            </div>

            {statusMessage && (
              <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                {statusMessage}
              </p>
            )}
          </form>
        </div>

        <div className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 rounded-full border border-slate-300 bg-white shadow-md" />
        <div className="pointer-events-none absolute -bottom-3 -left-3 h-10 w-10 rounded-full border border-slate-300 bg-white shadow-md" />
      </div>
    </div>
  );
}