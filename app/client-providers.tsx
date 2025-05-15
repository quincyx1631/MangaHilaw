"use client";

import type React from "react";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/auth-context";
import Header from "@/app/components/header/header";
import { Toaster } from "@/components/ui/toaster";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Header />
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
