"use client";

import { useEffect } from "react";

// Last-resort boundary: catches errors thrown in the root layout itself. Must
// render its own <html>/<body> because it replaces the whole document.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafaf9",
          color: "#1c1917",
          fontFamily: "system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#78716c", marginBottom: 24, lineHeight: 1.5 }}>
            An unexpected error occurred. Your data is safe — it lives in your browser.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "#8b5cf6",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
