import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus Oasis",
  description:
    "A cozy multiplayer study world by Ra Jae-heum (Student ID: 20261027).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
