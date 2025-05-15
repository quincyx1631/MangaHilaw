import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { ClientProviders } from "@/app/client-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MangaHilaw",
  description: "A modern manga reading website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
