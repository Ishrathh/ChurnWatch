import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
// const geistMono = Geist_Mono({
//   variable: "--font-geist",
//   subsets: ["latin"],
// })

export const metadata: Metadata = {
  title: "ChurnWatch - Customer Churn Prediction",
  description: "Predict and prevent customer churn with advanced machine learning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow">
            {children}
          </main>
          <Toaster richColors />
        </div>
      </body>
    </html>
  );
}