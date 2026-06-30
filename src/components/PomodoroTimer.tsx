"use client";

import { useState, useEffect } from "react";

const MODES = {
  focus: { label: "Focus", minutes: 25 },
  shortBreak: { label: "Short Break", minutes: 5 },
  longBreak: { label: "Long Break", minutes: 15 },
} as const;

type Mode = keyof typeof MODES;

const COLOR: Record<Mode, { ring: string; btn: string; badge: string }> = {
  focus: { ring: "#34d399", btn: "bg-emerald-500 hover:bg-emerald-600", badge: "bg-emerald-50 text-emerald-700" },
  shortBreak: { ring: "#38bdf8", btn: "bg-sky-500 hover:bg-sky-600", badge: "bg-sky-50 text-sky-700" },
  longBreak: { ring: "#a78bfa", btn: "bg-violet-500 hover:bg-violet-600", badge: "bg-violet-50 text-violet-700" },
};

function playChime() {
  try {
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  } catch {}
}

function sendNotification(body: string) {
  playChime();
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("Tranquil", { body, silent: true });
  }
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const total = MODES[mode].minutes * 60;
  const c = COLOR[mode];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - secondsLeft / total);

  const switchMode = (m: Mode) => {
    setMode(m);
    setRunning(false);
    setSecondsLeft(MODES[m].minutes * 60);
  };

  const handleStart = () => {
    if (!running && typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setRunning((r) => !r);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          if (mode === "focus") {
            setSessions((n) => n + 1);
            sendNotification("Focus session complete! Time for a break.");
          } else {
            sendNotification("Break over — ready to focus again?");
          }
          return MODES[mode].minutes * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const atStart = secondsLeft === total;

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-stone-800 dark:text-stone-100">Focus Timer</h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.badge}`}>
          {sessions} session{sessions !== 1 ? "s" : ""} today
        </span>
      </div>

      <div className="flex gap-1 bg-stone-100 dark:bg-stone-700 rounded-xl p-1 mb-5">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
              mode === m
                ? "bg-white dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-sm"
                : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-5">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--svg-ring-track)" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={radius} fill="none"
            stroke={c.ring} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }}
          />
          <text x="70" y="63" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="700" fill="var(--svg-text-primary)">
            {mins}:{secs}
          </text>
          <text x="70" y="84" textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="var(--svg-text-secondary)">
            {MODES[mode].label}
          </text>
        </svg>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStart}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${c.btn}`}
        >
          {running ? "Pause" : atStart ? "Start" : "Resume"}
        </button>
        <button
          onClick={() => switchMode(mode)}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
