"use client";

import { InputForm } from "@/components/mainSearch";
import { FlipWords } from "@/components/ui/flip-words";
import { motion } from "framer-motion";

export default function Page() {
  const words = ["Exploring", "Learning", "Searching"];
  return (
    <main className="text-foreground inset-0 flex h-screen w-full flex-col items-center justify-center bg-[radial-gradient(circle,#73737350_1px,transparent_1px)] p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Animated Title */}
        <div className="text-muted-foreground mx-auto flex items-center justify-center text-9xl font-normal md:text-4xl">
          Start
          <FlipWords words={words} /> <br />
        </div>

        {/* Animated InputForm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <InputForm />
        </motion.div>
      </div>
    </main>
  );
}
