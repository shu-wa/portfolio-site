"use client";

import { ArrowUpRight, Loader2 } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const busy = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    busy.current = true; setSending(true); setStatus("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data.entries())) });
      const result = await response.json();
      if (!response.ok) { setStatus(result.error ?? "送信できませんでした。"); return; }
      form.reset(); setStatus("メッセージを受け付けました。ありがとうございます。");
    } catch { setStatus("通信に失敗しました。入力を確認し、もう一度お試しください。"); }
    finally { busy.current = false; setSending(false); }
  }
  return <form onSubmit={submit} className="contact-form">
    <div className="contact-fields"><label>お名前 <span>NAME</span><input name="name" required maxLength={100} autoComplete="name" placeholder="玉木 秀杷" /></label><label>メールアドレス <span>EMAIL</span><input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="hello@example.com" /></label></div>
    <label>メッセージ <span>MESSAGE</span><textarea name="message" required maxLength={5000} rows={4} placeholder="気になること、つくりたいこと、話してみたいこと。" /></label>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="contact-actions"><small>ご入力いただいた情報は、ご連絡への返信に使用します。</small><button type="submit" disabled={sending} className="action-link">{sending ? "送信中" : "メッセージを送る"}{sending ? <Loader2 className="spin" size={20} /> : <ArrowUpRight size={20} />}</button></div>
    <p className="form-status" role="status" aria-live="polite">{status}</p>
  </form>;
}
