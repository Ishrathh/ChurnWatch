import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ChurnWatch",
  description: "Predict customer churn with machine learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.className} antialiased`}
      >
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}