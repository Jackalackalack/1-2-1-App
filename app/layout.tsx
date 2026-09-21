import type { Metadata } from "next";
import { config } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: config.owner.pageTitle,
  description: config.owner.pageDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ "--accent": config.owner.accentColor } as React.CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
