import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "FUNCTIA – Petualangan Relasi dan Fungsi",
  description:
    "Media pembelajaran interaktif Relasi dan Fungsi untuk siswa kelas VIII SMP berbasis Problem Based Learning dan Culturally Responsive Teaching dengan kearifan lokal Kota Salatiga.",
  keywords: ["relasi dan fungsi", "matematika SMP", "Salatiga", "CRT", "PBL", "FUNCTIA"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f6bff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f6f9ff] text-ink antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
