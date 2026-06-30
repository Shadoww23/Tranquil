"use client";

import { useState, useEffect } from "react";

const STEPS = [
  { label: "Inhale",  seconds: 4, scale: 1.35 },
  { label: "Hold",    seconds: 4, scale: 1.35 },
  { label: "Exhale",  seconds: 6, scale: 0.75 },
  { label: "Hold",    seconds: 2, scale: 0.75 },
];

export default function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(STEPS[0].seconds);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (secondsLeft > 0) {
      const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
      return () => clearTimeout(id);
    }
    const next = (stepIdx + 1) % STEPS.length;
    if (next === 0) setCycles((c) => c + 1);
    setStepIdx(next);
    setSecondsLeft(STEPS[next].seconds);
  }, [active, secondsLeft, stepIdx]);

  const stop = () => {
    setActive(false);
    setStepIdx(0);
    setSecondsLeft(STEPS[0].seconds);
    setCycles(0);
  };

  const step = STEPS[stepIdx];
  const scale = active ? step.scale : 1;
  const transition = active ? `transform ${step.seconds}s ease-in-out` : "none";

  return (
    <div className="rounded-2xl bg-white border border-stone-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-stone-800">Mindful Breathing</h2>
        {cycles > 0 && (
          <span className="text-xs bg-teal-50 text-teal-600 font-medium px-2 py-1 rounded-full">
            {cycles} cycle{cycles !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 py-3">
        <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
          <div
            className="absolute rounded-full bg-teal-100"
            style={{ width: 128, height: 128, opacity: 0.45, transform: `scale(${scale})`, transition }}
          />
          <div
            className="absolute rounded-full bg-teal-300"
            style={{ width: 84, height: 84, opacity: 0.6, transform: `scale(${scale})`, transition }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xl font-bold text-teal-700">
              {active ? secondsLeft : "·"}
            </span>
            <span className="text-xs font-medium text-teal-600">
              {active ? step.label : "Ready"}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-400 text-center max-w-[200px]">
          {active
            ? "Follow the circle — let the rhythm guide you."
            : "4-4-6-2 pattern to calm your nervous system."}
        </p>

        {!active ? (
          <button
            onClick={() => setActive(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-colors"
          >
            Begin
          </button>
        ) : (
          <button
            onClick={stop}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
