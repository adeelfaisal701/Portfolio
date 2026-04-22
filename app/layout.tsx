import type { Metadata } from "next";
import { Fira_Code, Inter, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import "./emerald-portfolio.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inst",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const firaCode = Fira_Code({
  variable: "--font-fira",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Faisal Adeel — Full-Stack Developer",
  description:
    "Full-stack web developer in Lahore, PK. Fast, modern web apps — SaaS, AI-powered tools, clean UI, shipped on time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${firaCode.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full antialiased">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
