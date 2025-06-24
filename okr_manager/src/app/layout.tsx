import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getSessionUserFromCookies } from "@/utils/session";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUserFromCookies();
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 min-h-screen font-sans`}>
        <nav className="bg-white border-b border-gray-200 h-36 flex items-center sticky top-0 z-50 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-4 w-full h-full">
            <Link href="/" className="font-bold text-2xl text-gray-900">OKR Manager</Link>
            <div>
              {user ? (
                <>
                  <span className="mr-4 text-gray-500">{user.email}</span>
                  <Link href="/logout" className="text-blue-600 hover:underline">Logout</Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="mr-4 text-blue-600 hover:underline">Login</Link>
                  <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
