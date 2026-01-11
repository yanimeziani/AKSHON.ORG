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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnalyticsTracker />
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
