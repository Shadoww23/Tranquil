"use client";

import { useEffect } from "react";
import Link from "next/link";

// Route-level error boundary: catches render/runtime errors in any page so the
// user gets a friendly recovery screen instead of a white page.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for logging/monitoring.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          An unexpected error occurred. Your data is safe — it lives in your browser, not on a server.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
