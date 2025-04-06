'use client'

import { InputForm } from "@/components/mainSearch";
import { FlipWords } from "@/components/ui/flip-words";
import { motion } from "framer-motion";

export default function Page() {
  const words = ["Exploring", "Learning" , "Searching" ];
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center inset-0 bg-backfround bg-[radial-gradient(circle,#73737350_1px,transparent_1px)] bg-[size:20px_20px] p-4 text-foreground">
      <div className="w-full max-w-2xl space-y-8">
        {/* Animated Title */}
        <div className="text-9xl md:text-4xl mx-auto font-normal flex justify-center items-center text-muted-foreground">
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
