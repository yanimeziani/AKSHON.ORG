import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import AnalyticsConsent from "@/components/AnalyticsConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AKSHON | Sovereign Intelligence Matrix",
  description: "Actionable Intelligence at the Speed of Thought. Access the world's most powerful research corpus and synthesis engine.",
  openGraph: {
    title: "AKSHON | Sovereign Intelligence Matrix",
    description: "Actionable Intelligence at the Speed of Thought.",
    images: ["/og-image.png"], // I will assume this exists or create it
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden dark`}
      >
        {/* Skip to main content link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Global Aurora Background */}
        <div className="fixed inset-0 z-[-1] opacity-30 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[150px] rounded-full mix-blend-screen animate-aurora" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/20 blur-[150px] rounded-full mix-blend-screen animate-aurora" style={{ animationDelay: '-10s' }} />
        </div>

        <AnalyticsTracker />
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
