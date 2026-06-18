"use client";

import { Authenticator } from "@aws-amplify/ui-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <Authenticator hideSignUp>
          {({ signOut, user }) => (
            <section>
              <div className="mb-10 flex items-center justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-cyan-400">
                    Admin
                  </p>
                  <h1 className="text-4xl font-bold">管理画面</h1>
                  <p className="mt-3 text-slate-300">
                    ログイン中：
                    {user?.signInDetails?.loginId ?? user?.username}
                  </p>
                </div>

                <button
                  onClick={signOut}
                  className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:bg-slate-800"
                >
                  ログアウト
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-3 text-2xl font-bold">お問い合わせ管理</h2>
                <p className="text-slate-300">
                  次のステップで、DynamoDBに保存されたお問い合わせ一覧をここに表示します。
                </p>
              </div>
            </section>
          )}
        </Authenticator>
      </div>
    </main>
  );
}