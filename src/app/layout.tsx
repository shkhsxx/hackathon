import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Style Fit Advisor — 나에게 맞는 핏 찾기",
  description:
    "AI가 사진 한 장으로 체형을 분석하고, 나에게 가장 잘 어울리는 스타일과 상품을 추천해드립니다.",
  keywords: ["체형 분석", "스타일 추천", "AI 패션", "핏 추천", "온라인 쇼핑"],
  openGraph: {
    title: "AI Style Fit Advisor",
    description: "사진 한 장으로 나만의 스타일을 찾아보세요",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
