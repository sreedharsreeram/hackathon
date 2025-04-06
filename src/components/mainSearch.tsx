"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "./ui/textarea"
import { useRouter } from "next/navigation"
import doEverything, { createProject } from "@/server/actions"

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "BRUH",
  }),
})

export function InputForm() {
    const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
        const project = await createProject()
        if(!project) {
            toast.error("Project not created")
            return
        }
        
        const res = await doEverything({ query: data.username, projectId: project.id })
        if(!res) {
            toast.error("Node not created")
            return
        }
        router.push(`/${project.id}`)
    } catch (error) {
        console.log(error)
    }
    toast.success("Noice")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
              <Textarea placeholder="Type your search here." className="text-foreground bg-background" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" >Submit</Button>
      </form>
    </Form>
  )
}
