import * as React from "react"

import { SearchForm } from "@/components/search-form"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import UserAvatar from "./UserAvatar"
import { ModeToggle } from "./ModeToggle"
import { getProjects } from "@/server/actions"
import { CornerDownRight, Plus } from "lucide-react"
import Link from "next/link"


export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = await getProjects()
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row gap-2 justify-center items-center" >
        <UserAvatar />
        <ModeToggle />
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <h2 className="text-lg font-bold mx-5" >
          Projects
        </h2>
      <div className=" space-y-2">
        {data!.map((project) => (
          <div
            key={project.id}
            className="group flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <Link
          href={`/${project.id}`}
          className="flex flex-row justify-center items-center gap-2 mx-5">
              <CornerDownRight size={17} />
              <span className="font-medium">Project {project.id}</span>
             
            </Link>
          </div>
        ))}
      </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <Link href={'/'} className="w-full flex justify-center items-center">
          <Plus />
          New Project
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
