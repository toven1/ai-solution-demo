import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FounderOS AI",
  description: "AI 사업화 워크스페이스 SaaS"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
