import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/context/GlobalStore";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gentech Car Care | Premium Paint Protection Film",
  description: "Next-generation automotive protection solutions backed by industry expertise and advanced Aliphatic TPU technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning style={{ background: '#0A0A0A' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0A0A] text-white`}
        suppressHydrationWarning
        style={{ background: '#0A0A0A', color: '#fff' }}
      >
        <GlobalProvider>
          <ScrollToTop />
          {children}
          <WhatsAppButton />
        </GlobalProvider>
      </body>
    </html>
  );
}