import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/server/auth"
import { redirect } from "next/navigation"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex w-screen h-screen">
      <AppSidebar />
      <main className="flex-1 flex justify-center w-full h-full bg-background text-foreground p-4">
    {children}
</main>
    </div>
  )
}