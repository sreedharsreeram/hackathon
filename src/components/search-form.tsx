'use client'

import { Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { getProjects } from "@/server/actions"
import { format } from "date-fns"

interface Project {
  id: number;
  userId: string;
  chatHistory: {
    question: string;
    answer: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const [search, setSearch] = useState('')
  const [data, setData] = useState<Project[]>([])
  const [filteredData, setFilteredData] = useState<Project[]>([])

  useEffect(() => {
    const fetchData = async() => {
      const res = await getProjects()
      if (res) {
        const formattedData = res.map(project => ({
          ...project,
          createdAt: new Date(project.createdAt).toISOString(),
          updatedAt: new Date(project.updatedAt).toISOString()
        }))
        setData(formattedData)
        setFilteredData(formattedData)
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    if (!search) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter(project => {
      const projectId = project.id.toString()
      return projectId.includes(search)
    })
    setFilteredData(filtered)
  }, [search, data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  return (
    <form {...props} className="h-full w-full" onSubmit={handleSubmit}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search by project ID..."
            className="pl-8"
            value={search}
            onChange={handleInputChange}
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-4 space-y-2">
        {filteredData.map((project) => (
          <div
            key={project.id}
            className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex flex-col">
              <span className="font-medium">Project {project.id}</span>
              <span className="text-xs text-muted-foreground">
                {project.chatHistory.length} conversations
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(project.updatedAt), 'MMM d, yyyy')}
            </div>
          </div>
        ))}
      </div>
    </form>
  )
}
