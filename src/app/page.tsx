import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import SearchForm from "@/components/search-form";

export default async function HomePage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-[#1c1c24] p-4 text-white">
      <div className="flex w-full max-w-3xl flex-col items-start justify-center gap-8">
        <h1 className="font-sans text-3xl font-bold text-white">
          Start where you left off....
        </h1>
        <SearchForm />
      </div>
    </main>
  );
}
