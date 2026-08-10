import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

// Distinctive display face — engineered, geometric grotesque that carries the
// SENTINEL brand voice (radar, neural, precision). Body stays on Inter (Apple's
// "system font body + custom display" pattern).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

// Editorial italic used for single accent words ("Exam.", "plan.") — the
// "one word in a different voice" trick.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif-accent",
});

export const metadata: Metadata = {
  title: "SENTINEL EXAM | AI Past Paper Analysis",
  description: "Stop guessing. Start studying what actually matters with AI-powered exam pattern analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

