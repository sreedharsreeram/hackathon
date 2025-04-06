import {InputForm} from "@/components/mainSearch";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";


export default function Page() {
  return (

    <main className="flex h-screen flex-col items-center justify-center absolute inset-0 w-full bg-backfround bg-[radial-gradient(circle,#73737350_1px,transparent_1px)] bg-[size:20px_20px] p-4 text-white">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl text-center text-foreground mb-8 ⁠">
          Start where you left off ....
        </h1>
        <InputForm />
      </div>
    </main>
  )
}
