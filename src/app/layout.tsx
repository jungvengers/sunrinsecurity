import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정보보호과 | 선린인터넷고등학교",
  description: "선린인터넷고등학교 정보보호과 공식 홈페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
