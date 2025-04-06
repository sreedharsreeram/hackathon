import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <main className="text-foreground relative flex h-full w-full flex-1 justify-center bg-[radial-gradient(circle,#73737350_1px,transparent_1px)] p-4">
          {/* Floating sidebar trigger that's always visible */}
          <div className="absolute left-4 top-4 z-50">
              <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}