import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CloudAccount - ระบบบัญชีออนไลน์",
  description: "Cloud Accounting Platform - ระบบบัญชีออนไลน์แบบครบวงจร",
  keywords: ["accounting", "cloud", "บัญชี", "ออนไลน์", "SME"],
};

import AuthGuard from "@/components/auth/auth-guard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
