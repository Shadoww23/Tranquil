"use client";

import { useState } from "react";
import { resolveVanityUrl, importSteamLibrary } from "@/lib/steamImport";
import { saveLibrary, saveSteamCredentials } from "@/lib/userLibrary";

type Step = "key" | "id" | "importing" | "done";

interface Props {
  onClose: () => void;
  onImported: () => void;
}

export default function SteamConnect({ onClose, onImported }: Props) {
  const [step, setStep] = useState<Step>("key");
  const [apiKey, setApiKey] = useState("");
  const [steamInput, setSteamInput] = useState("");
  const [progress, setProgress] = useState({ step: "", current: 0, total: 0 });
  const [error, setError] = useState("");
  const [gameCount, setGameCount] = useState(0);

  const handleKeyNext = () => {
    if (apiKey.trim().length < 20) {
      setError("That doesn't look like a valid Steam API key.");
      return;
    }
    setError("");
    setStep("id");
  };

  const handleImport = async () => {
    setError("");
    setStep("importing");

    let steamId = steamInput.trim();
    const urlMatch = steamId.match(/steamcommunity\.com\/(?:id|profiles)\/([^/]+)/);
    if (urlMatch) steamId = urlMatch[1];

    if (!/^\d{17}$/.test(steamId)) {
      try {
        const resolved = await resolveVanityUrl(steamId, apiKey.trim());
        if (!resolved) {
          setError(
            "Couldn't resolve that username to a Steam ID. Try using your 64-bit Steam ID instead (find it at steamid.io)."
          );
          setStep("id");
          return;
        }
        steamId = resolved;
      } catch {
        setError("Failed to resolve Steam ID. Check your API key and try again.");
        setStep("id");
        return;
      }
    }

    try {
      const games = await importSteamLibrary(steamId, apiKey.trim(), (stepLabel, current, total) => {
        setProgress({ step: stepLabel, current, total });
      });

      saveSteamCredentials(apiKey.trim(), steamId);
      saveLibrary({
        meta: { steamId, gameCount: games.length, importedAt: new Date().toISOString() },
        games,
      });

      setGameCount(games.length);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Please try again.");
      setStep("id");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <h2 className="font-semibold text-stone-800 dark:text-stone-100">Connect Steam</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" aria-label="Close">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {step !== "importing" && step !== "done" && (
            <div className="flex items-center gap-2 mb-5">
              {(["key", "id"] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    step === s ? "bg-sky-500 text-white" : i < ["key", "id"].indexOf(step) ? "bg-emerald-500 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                  }`}>
                    {i < ["key", "id"].indexOf(step) ? "✓" : i + 1}
                  </div>
                  {i === 0 && <div className="w-8 h-px bg-stone-200 dark:bg-stone-700" />}
                </div>
              ))}
              <span className="text-xs text-stone-400 dark:text-stone-500 ml-1">{step === "key" ? "API Key" : "Steam ID"}</span>
            </div>
          )}

          {step === "key" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-stone-700 dark:text-stone-300 mb-1 font-medium">Steam Web API Key</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                  Get your free key at <span className="text-sky-500 font-medium">steamcommunity.com/dev/apikey</span> — your Steam account must have a purchase on record. Your key is stored locally and never sent to our servers.
                </p>
                <input
                  type="password"
                  placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleKeyNext()}
                  className="w-full text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 font-mono"
                  autoFocus
                  spellCheck={false}
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button onClick={handleKeyNext} className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors">Next →</button>
            </div>
          )}

          {step === "id" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-stone-700 dark:text-stone-300 mb-1 font-medium">Your Steam Profile</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                  Enter your Steam username, profile URL, or 64-bit Steam ID. Your profile must be set to <strong>Public</strong> in Steam → Settings → Privacy.
                </p>
                <input
                  type="text"
                  placeholder="username · steamcommunity.com/id/you · 7656119…"
                  value={steamInput}
                  onChange={(e) => setSteamInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleImport()}
                  className="w-full text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => { setError(""); setStep("key"); }} className="px-4 py-2.5 text-sm text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors">← Back</button>
                <button onClick={handleImport} disabled={!steamInput.trim()} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">Import Library</button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-sky-500 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{progress.step || "Connecting to Steam…"}</p>
                {progress.total > 0 && <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{progress.current} / {progress.total} games</p>}
              </div>
              {progress.total > 0 && (
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }} />
                </div>
              )}
              <p className="text-xs text-stone-400 dark:text-stone-500">This may take a moment for large libraries.</p>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{gameCount} games imported</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Your library has been analyzed. Curated games use verified mechanic data; others are inferred from Steam Store descriptions.</p>
              </div>
              <button onClick={() => { onImported(); onClose(); }} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">View my library →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
