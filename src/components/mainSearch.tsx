"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRef } from 'react';

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "./ui/textarea"
import { Loader2, ArrowRight, TrendingUp, BookOpen, Lightbulb, Sparkles } from "lucide-react"
import { useProgressiveSearch } from '@/hooks/useProgressiveSearch'
import confetti from "canvas-confetti"

const FormSchema = z.object({
  query: z.string().min(5, {
    message: "Please enter a search query (at least 5 characters).",
  }),
})

export function InputForm() {
    const { isLoading, startResearchProcess } = useProgressiveSearch();
    const buttonRef = useRef<HTMLButtonElement>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
        query: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        await startResearchProcess(data.query);
    }

    const triggerConfetti = async () => {
        const isValid = await form.trigger('query');
        
        if (isValid && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            confetti({
                particleCount: 100,
                spread: 70,
                origin: {
                    x: x / window.innerWidth,
                    y: y / window.innerHeight,
                },
            });
        }
    }

    const suggestedQuestions = [
      {
        question: "what is pizza?",
        icon: TrendingUp,
        delay: 0.4,
      },
      {
        question: "What is an earthquake?",
        icon: BookOpen,
        delay: 0.5,
      },
      {
        question: "What are the ethical implications of artificial intelligence?",
        icon: Lightbulb,
        delay: 0.6,
      },
    ];

    return (
      <>
              <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 relative">
                <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem className="relative">
                            <FormControl>
                                <div className="relative">
                                    <Textarea 
                                        placeholder="What topic do you want to research?" 
                                        className="text-foreground bg-background min-h-[120px] pr-[100px] resize-none" 
                                        {...field} 
                                    />
                                    <div className="absolute bottom-3 right-3">
                                        <Button 
                                            ref={buttonRef}
                                            type="submit" 
                                            disabled={isLoading}
                                            size="sm"
                                            className="rounded-full px-4"
                                            onClick={triggerConfetti}
                                        >
                                            {isLoading ? (
                                                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Wait</>
                                            ) : (
                                                <><span className="mr-1">Research</span> <ArrowRight className="h-3 w-3" /></>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
        </motion.div>
            {/* Suggested Questions */}
            <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Try these questions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {suggestedQuestions.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: item.delay }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 bg-background hover:bg-accent/20 border border-border hover:border-primary/30 transition-all group"
                    onClick={() => form.setValue("query", item.question)}
                  >
                    <item.icon className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-normal truncate">{item.question}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </>
    )
}