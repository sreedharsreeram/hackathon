"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRef } from 'react';

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "./ui/textarea"
import { Loader2, ArrowRight } from "lucide-react"
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    return (
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
    )
}