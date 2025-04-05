// import GetEmbedding from "@/components/GetEmbedding";
import { auth } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import Example from "./example";

export default async function HomePage() {
  const session = await auth()
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="h-full w-full justify-center items-center flex flex-col">
      {session.user.email}
      <Example />
    </main>
  );
}
