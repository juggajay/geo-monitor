import type { Metadata } from "next";
import { Syne, Outfit } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GEO Monitor — AI Search Visibility for Agencies",
  description:
    "Track how AI search engines represent your clients. GEO Monitor gives agencies real-time visibility into Google AI Overviews, ChatGPT, Perplexity, and more.",
  openGraph: {
    title: "GEO Monitor — AI Search Visibility for Agencies",
    description:
      "Track how AI search engines represent your clients across Google AI Overviews, ChatGPT, Perplexity, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${outfit.variable}`}>{children}</body>
    </html>
  );
}
