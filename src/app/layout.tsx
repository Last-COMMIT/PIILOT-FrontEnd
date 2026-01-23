import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Header } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";

const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PIILOT",
  description:
    "개인정보 유출을 사전에 방지하고 탐지하는 AI 기반 파일럿 관제 플랫폼입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSans.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ marginLeft: "var(--sidebar-width)" }}
          >
            <Header />
            <main className="flex-1 overflow-y-auto bg-[var(--color-bg-main)]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
