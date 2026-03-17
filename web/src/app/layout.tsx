import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-thai",
});

export const metadata: Metadata = {
  title: "MedCare",
  description: "ระบบจัดยาอัตโนมัติสำหรับสถานดูแลผู้สูงอายุ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} antialiased`}>{children}</body>
    </html>
  );
}
