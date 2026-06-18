"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatusMessage("");

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

      setStatusMessage(data.message);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatusMessage("通信エラーが発生しました。");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold">Name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          placeholder="Your name"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold">Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          placeholder="example@example.com"
          type="email"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold">Message</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          placeholder="お問い合わせ内容を入力してください"
        />
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
      >
        {isSending ? "送信中..." : "送信する"}
      </button>

      {statusMessage && (
        <p className="mt-4 text-sm text-cyan-300">{statusMessage}</p>
      )}
    </form>
  );
}