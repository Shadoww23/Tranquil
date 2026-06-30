"use client";

import { useState, useEffect } from "react";

export default function DailyIntention() {
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState("");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("tranquil-intention");
    if (stored) setSaved(stored);
    else setEditing(true);
  }, []);

  if (!mounted) return null;

  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    localStorage.setItem("tranquil-intention", trimmed);
    setSaved(trimmed);
    setEditing(false);
    setDraft("");
  };

  if (editing) {
    return (
      <div className="flex gap-2 w-full">
        <input
          type="text"
          placeholder="What's your intention for today?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="flex-1 text-sm bg-white/70 dark:bg-stone-800/70 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2 text-stone-700 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
          autoFocus
        />
        <button
          onClick={save}
          className="px-3 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
        >
          Set
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(saved); setEditing(true); }}
      className="text-left w-full group"
    >
      <p className="text-xs text-stone-400 dark:text-stone-500">Today&apos;s intention</p>
      <p className="text-sm font-medium text-stone-700 dark:text-stone-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
        &ldquo;{saved}&rdquo;{" "}
        <span className="text-stone-300 dark:text-stone-600 text-xs font-normal">&middot; edit</span>
      </p>
    </button>
  );
}
