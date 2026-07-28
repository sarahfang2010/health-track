import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "健康追踪",
  description: "饮食热量识别与健康管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
