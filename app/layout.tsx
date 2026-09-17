import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book time with Jack Abraham",
  description: "Book a call with Jack Abraham.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
