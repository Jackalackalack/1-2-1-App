import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book a 1-2-1 — Jack Abraham",
  description: "Book a free 30-minute 1-2-1 with Jack Abraham. Music, education and mentorship.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
