"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";

type Contact = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
        async function fetchContacts() {
        try {
            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken?.toString();

            if (!idToken) {
            setErrorMessage("ログイン情報を取得できませんでした。");
            return;
            }

            const response = await fetch("/api/contacts", {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
            });

            const data = await response.json();

            if (!response.ok) {
            setErrorMessage(data.error ?? "お問い合わせ一覧の取得に失敗しました。");
            return;
            }

            setContacts(data);
        } catch (error) {
            console.error("お問い合わせ一覧取得エラー", error);
            setErrorMessage("通信エラーが発生しました。");
        } finally {
            setLoading(false);
        }
        }


        fetchContacts();
    }, []);

    async function handleDelete(id: string) {
        const confirmed = window.confirm("このお問い合わせを削除しますか？");

        if (!confirmed) {
            return;
        }

        try {
            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken?.toString();

            if (!idToken) {
            setErrorMessage("ログイン情報を取得できませんでした。");
            return;
            }

            const response = await fetch(`/api/contacts/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
            });

            const data = await response.json();

            if (!response.ok) {
            setErrorMessage(data.error ?? "お問い合わせの削除に失敗しました。");
            return;
            }

            setContacts((currentContacts) =>
            currentContacts.filter((contact) => contact.id !== id)
            );
        } catch (error) {
            console.error("お問い合わせ削除エラー", error);
            setErrorMessage("通信エラーが発生しました。");
        }
    }

  if (loading) {
    return <p className="text-slate-300">お問い合わせを読み込み中...</p>;
  }

  if (errorMessage) {
    return <p className="text-red-300">{errorMessage}</p>;
  }

  if (contacts.length === 0) {
    return <p className="text-slate-300">お問い合わせはまだありません。</p>;
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <article
          key={contact.id}
          className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
        >
          <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-lg font-bold">{contact.name}</h3>
                    <p className="text-sm text-cyan-300">{contact.email}</p>
                </div>

                <div className="flex items-center gap-3">
                    <time className="text-sm text-slate-400">
                        {new Date(contact.createdAt).toLocaleString("ja-JP")}
                    </time>

                    <button
                        onClick={() => handleDelete(contact.id)}
                        className="rounded-lg border border-red-400 px-3 py-1 text-sm font-semibold text-red-300 transition hover:bg-red-950"
                    >
                        削除
                    </button>
                </div>
          </div>

          <p className="whitespace-pre-wrap leading-7 text-slate-300">
            {contact.message}
          </p>
        </article>
      ))}
    </div>
  );
}