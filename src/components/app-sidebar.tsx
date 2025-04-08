import * as React from "react";
import Link from "next/link";
import { CornerDownRight, Plus, AlertCircle } from "lucide-react"; // Import AlertCircle for errors
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import UserAvatar from "./UserAvatar";
import { ModeToggle } from "./ModeToggle";
import { getProjects } from "@/server/actions"; // Server action
import { headers } from "next/headers";
import TrashButton from "./TrashButton";

// Define type for project data (can be shared)
type Project = {
  id: number;
  name: string;
  // Add other fields if needed, e.g., updatedAt
};

// Component for rendering a single project link
function ProjectListItem({ project }: { project: Project }) {
  return (
    // Use motion here IF you wrap the list in a client component later
    <div className='flex flex-row gap-2 justify-between items-center max-w-full w-full' >
    <Link
      href={`/${project.id}`}
      className="group flex items-center w-3/5 gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-in-out text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <CornerDownRight
          size={16}
          className="text-muted-foreground/70 transition-transform group-hover:translate-x-0.5"
        />
        <span className="flex-1 truncate font-medium">{project.name}</span>
        {/* Active state styling is difficult here without client-side routing info */}
      </Link>
      <TrashButton id={project.id} name={project.name} />
    </div>
  );
}

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Don't render sidebar on login page
  if (pathname === "/login") {
    return null;
  }

  let projects: Project[] = [];
  let fetchError: string | null = null;

  // Only fetch projects if user is authenticated
  try {
    const data = await getProjects();
    if (data) {
      projects = data;
    }
  } catch (err) {
    console.error("AppSidebar: Error fetching projects:", err);
    fetchError = "Failed to load projects.";
  }

  return (
    <Sidebar {...props}>
      {/* Header remains simple */}
      <SidebarHeader className="flex flex-row items-center justify-between border-b p-3">
        <UserAvatar />
        <ModeToggle />
      </SidebarHeader>

      {/* Content section with better padding/spacing */}
      <SidebarContent className="space-y-4 p-3" suppressHydrationWarning>
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-semibold tracking-tight">Threads</h2>
          {/* Optional: Add count badge? */}
          {/* <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">{projects.length}</span> */}
        </div>

        {/* Conditional Rendering based on fetch result */}
        {fetchError ? (
          <div className="text-destructive flex items-center gap-2 px-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{fetchError}</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-muted-foreground px-2 text-sm italic">
            No projects yet.
          </div>
        ) : (
          // Render the list if data exists
          <div className="space-y-1">
            {projects.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </div>
        )}
      </SidebarContent>

      {/* Footer remains simple */}
      <SidebarFooter className="border-t p-3">
        <SidebarMenuButton asChild>
          <Link
            href={"/"}
            className="flex w-full items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            New Project
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
