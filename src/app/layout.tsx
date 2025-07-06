import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./okr-hover.css";
import ClientAppShell from "./ClientAppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OKR Manager",
  description: "OKR Management System for HMCTS CFT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 min-h-screen font-sans`}>
        <ClientAppShell>
          {children}
        </ClientAppShell>
      </body>
    </html>
  );
}
