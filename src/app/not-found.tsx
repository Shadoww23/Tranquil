import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
      <div className="text-center max-w-md">
        <p className="text-5xl font-bold text-violet-400 dark:text-violet-500 mb-2 tabular-nums">404</p>
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-2">
          Page not found
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
          That page doesn&apos;t exist — it may have moved, or the link is off.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold transition-colors"
        >
          Back to library
        </Link>
      </div>
    </div>
  );
}
