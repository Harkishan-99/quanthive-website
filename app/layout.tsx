import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { luxe_uno } from "@/lib/fonts";
import "./globals.css";
import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
/* 
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});
 */
export const metadata: Metadata = {
  title: "QuantHive | Democratizing Investment Strategies",
  description:
    "Leveraging AI and mathematical modeling to democratize investment strategies",
  generator: "v0.dev",
  icons: {
    icon: "/QHL.png",
    apple: "/QHL.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${luxe_uno.variable} relative`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
