"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { useState } from "react";

export default function SeedProjectsButton() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSeed() {
    const confirmed = window.confirm(
      "data/projects.ts の作品データをDynamoDBに投入しますか？"
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSending(true);
      setMessage("");

      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        setMessage("ログイン情報を取得できませんでした。");
        return;
      }

      const response = await fetch("/api/admin/seed-projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "作品データの投入に失敗しました。");
        return;
      }

      setMessage(data.message);
    } catch (error) {
      console.error("作品データ投入エラー", error);
      setMessage("通信エラーが発生しました。");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-3 text-2xl font-bold">作品データ管理</h2>

      <p className="mb-4 text-slate-300">
        現在の data/projects.ts の作品データをDynamoDBに投入します。
        作品紹介を更新したあとに実行すると、DynamoDB側の内容も更新されます。
      </p>

      <button
        onClick={handleSeed}
        disabled={isSending}
        className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
      >
        {isSending ? "投入中..." : "作品データをDynamoDBに投入"}
      </button>

      {message && <p className="mt-4 text-sm text-cyan-300">{message}</p>}
    </div>
  );
}