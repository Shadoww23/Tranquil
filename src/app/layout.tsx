import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Tranquil — Anti-FOMO Gaming Insights",
    template: "%s · Tranquil",
  },
  description:
    "Score your Steam library on Design Risk (how predatory a game's monetisation is) and Joy Index (genuine enjoyment). Know what you're playing.",
  applicationName: "Tranquil",
  keywords: [
    "gaming", "steam", "monetization", "dark patterns", "design risk",
    "anti-fomo", "loot boxes", "gacha", "pay-to-win", "gaming wellbeing",
  ],
  openGraph: {
    title: "Tranquil — Anti-FOMO Gaming Insights",
    description:
      "Score your Steam library on Design Risk and Joy — know what you're playing.",
    url: "/",
    siteName: "Tranquil",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tranquil — Anti-FOMO Gaming Insights",
    description: "Score your Steam library on Design Risk and Joy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('tranquil-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch{}` }} />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100">
        {children}
      </body>
    </html>
  );
}
