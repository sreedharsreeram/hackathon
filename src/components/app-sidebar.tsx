import * as React from 'react';
import Link from 'next/link';
import { CornerDownRight, Plus, AlertCircle } from 'lucide-react'; // Import AlertCircle for errors
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import UserAvatar from './UserAvatar';
import { ModeToggle } from './ModeToggle';
import { getProjects } from '@/server/actions'; // Server action
import { headers } from 'next/headers';

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
    <Link
      href={`/${project.id}`}
      className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-in-out text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <CornerDownRight
        size={16}
        className="transition-transform group-hover:translate-x-0.5 text-muted-foreground/70"
      />
      <span className="truncate flex-1 font-medium">{project.name}</span>
      {/* Active state styling is difficult here without client-side routing info */}
    </Link>
  );
}

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
    console.error('AppSidebar: Error fetching projects:', err);
    fetchError = 'Failed to load projects.';
  }

  return (
    <Sidebar {...props}>
      {/* Header remains simple */}
      <SidebarHeader className="flex flex-row items-center justify-between p-3 border-b">
        <UserAvatar />
        <ModeToggle />
      </SidebarHeader>

      {/* Content section with better padding/spacing */}
      <SidebarContent className="p-3 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
          {/* Optional: Add count badge? */}
          {/* <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">{projects.length}</span> */}
        </div>

        {/* Conditional Rendering based on fetch result */}
        {fetchError ? (
          <div className="flex items-center gap-2 px-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{fetchError}</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="px-2 text-sm text-muted-foreground italic">
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
      <SidebarFooter className="p-3 border-t">
        <SidebarMenuButton asChild>
          <Link
            href={'/'}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium"
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