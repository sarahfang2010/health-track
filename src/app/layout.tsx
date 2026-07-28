import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { RefreshOnBack } from "@/components/layout/refresh-on-back";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "健康追踪",
  description: "饮食热量识别与健康管理",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <RefreshOnBack />
        {children}
      </body>
    </html>
  );
}
