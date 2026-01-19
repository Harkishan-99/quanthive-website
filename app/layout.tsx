import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { luxe_uno } from "@/lib/fonts";
import "./globals.css";
import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// PERFORMANCE: Load fonts via next/font for better performance (no render-blocking)
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
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
      <body className={`${luxe_uno.variable} ${inter.variable} ${spaceGrotesk.variable} relative`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={false} forcedTheme="dark">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
