import { auth } from "@/server/auth";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Hackathon",
  description: "Help you get back to research",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning >{children}</body>
    </html>
  );
}
