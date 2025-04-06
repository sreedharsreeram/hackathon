import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

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
    <div className="flex h-screen w-screen">
      <AppSidebar />
      <main className="text-foreground flex h-full w-full flex-1 justify-center bg-[radial-gradient(circle,#73737350_1px,transparent_1px)] p-4">
        {children}
      </main>
    </div>
  );
}
