import { ImageResponse } from "next/og";

export const alt = "Tranquil — Anti-FOMO Gaming Insights";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social-share card, rendered by Next's OG image generator.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1c1917 0%, #2e1065 100%)",
          color: "#f5f5f4",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#8b5cf6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Tranquil</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          Anti-FOMO Gaming Insights
        </div>
        <div style={{ fontSize: 32, color: "#a8a29e", marginTop: 28, maxWidth: 900 }}>
          Score your Steam library on Design Risk and Joy — know what you&apos;re playing.
        </div>
      </div>
    ),
    { ...size }
  );
}
