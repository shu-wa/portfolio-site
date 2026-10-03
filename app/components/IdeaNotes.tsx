"use client";

import { AppWindow, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";

type Note = { id: string; title: string; done: boolean };
type Filter = "all" | "open" | "done";
const storageKey = "portfolio:idea-notes:v1";
const changeEvent = "portfolio-ideas-change";
const limit = 12;
const initialNotes: Note[] = [
  { id: "seed-game", title: "小さなゲームをつくる", done: false },
  { id: "seed-system", title: "気になる仕組みを試す", done: false },
];
const initialSnapshot = JSON.stringify(initialNotes);
let memorySnapshot: string | null = null;

function getSnapshot() {
  if (memorySnapshot !== null) return memorySnapshot;
  try { return window.localStorage.getItem(storageKey) ?? initialSnapshot; }
  catch { return initialSnapshot; }
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) { memorySnapshot = null; onChange(); }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, onChange);
  };
}

function readNotes(snapshot: string): Note[] {
  try {
    if (snapshot.length > 12000) return initialNotes;
    const value: unknown = JSON.parse(snapshot);
    if (!Array.isArray(value) || value.length > limit) return initialNotes;
    const ids = new Set<string>();
    for (const note of value) {
      if (!note || typeof note !== "object" || typeof note.id !== "string" ||
        !/^[a-zA-Z0-9-]{1,80}$/.test(note.id) || ids.has(note.id) ||
        typeof note.title !== "string" || !note.title.trim() || note.title.length > 48 ||
        typeof note.done !== "boolean") return initialNotes;
      ids.add(note.id);
    }
    return value.map(({ id, title, done }) => ({ id, title, done }));
  } catch { return initialNotes; }
}

function saveNotes(notes: Note[]) {
  const snapshot = JSON.stringify(notes);
  let persisted = true;
  try { window.localStorage.setItem(storageKey, snapshot); memorySnapshot = null; }
  catch { memorySnapshot = snapshot; persisted = false; }
  window.dispatchEvent(new Event(changeEvent));
  return persisted;
}

export default function IdeaNotes() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => initialSnapshot);
  const notes = useMemo(() => readNotes(snapshot), [snapshot]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const visible = notes.filter((note) => filter === "all" || note.done === (filter === "done"));
  const remaining = notes.filter((note) => !note.done).length;

  function update(transform: (current: Note[]) => Note[], message: string) {
    const persisted = saveNotes(transform(readNotes(getSnapshot())));
    setStatus(persisted ? message : "一時保存しました（ブラウザの保存が無効です）");
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = title.trim();
    if (!normalized) { setStatus("メモを入力してください。"); return; }
    if (readNotes(getSnapshot()).length >= limit) { setStatus("メモは12件までです。"); return; }
    update((current) => [{ id: crypto.randomUUID(), title: normalized, done: false }, ...current], "メモを保存しました");
    setTitle(""); setFilter("all");
    if (list.current) list.current.scrollTop = 0;
  }

  return <div className="idea-notes demo-surface">
    <div className="sketch-app-header"><span><AppWindow size={16} aria-hidden="true" />アイデアメモ</span><span>このブラウザに保存</span></div>
    <form className="idea-form" onSubmit={add}>
      <label className="sr-only" htmlFor="idea-note-title">つくりたいこと</label>
      <input id="idea-note-title" value={title} maxLength={48} placeholder="つくってみたいもの" autoComplete="off" onChange={(event) => setTitle(event.target.value)} />
      <button type="submit" className="icon-button" aria-label="メモを追加" title="メモを追加"><Plus size={18} /></button>
    </form>
    <div className="idea-toolbar">
      <div className="idea-filters" role="group" aria-label="メモの絞り込み">{[
        { id: "all" as const, name: "すべて", label: "メモをすべて表示" },
        { id: "open" as const, name: "未完了", label: "未完了のメモを表示" },
        { id: "done" as const, name: "完了", label: "完了したメモを表示" },
      ].map(({ id, name, label }) => <button key={id} aria-label={label} aria-pressed={filter === id} onClick={() => setFilter(id)}>{name}</button>)}</div>
      <span className="mono">残り {remaining}</span>
    </div>
    <div className="idea-list" ref={list} role="region" aria-label="メモ一覧" tabIndex={0}>
      {visible.length ? <ul>{visible.map((note) => <li key={note.id} data-done={note.done}>
        <label><input type="checkbox" checked={note.done} onChange={() => update((current) => current.map((item) => item.id === note.id ? { ...item, done: !item.done } : item), note.done ? "未完了に戻しました" : "完了にしました")} /><span title={note.title}>{note.title}</span></label>
        <button className="icon-button" aria-label={`${note.title}を削除`} title="メモを削除" onClick={() => update((current) => current.filter((item) => item.id !== note.id), "メモを削除しました")}><Trash2 size={15} /></button>
      </li>)}</ul> : <p className="idea-empty">メモはありません</p>}
    </div>
    <p className="sketch-status" role="status">{status}</p>
  </div>;
}
