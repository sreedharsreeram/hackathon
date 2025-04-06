import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/Provider/provider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner"

import { type Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Hackathon",
  description: "Help you get back to research",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
                    <Toaster closeButton position="bottom-right" richColors />
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
            <SidebarTrigger className="-ml-1 z-[9999] absolute m-4" />
        {children}

  </SidebarInset>
            </SidebarProvider>
    </ThemeProvider>
      </body>
    </html>
  );
}
