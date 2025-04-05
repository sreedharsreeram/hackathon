"use client";

import {
  BookOpen,
  ChevronRight,
  History,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import QueryHistory from "@/components/query-history";

interface CustomSidebarProps {
  currentQuery?: string;
  onQueryClick?: (query: string) => void;
}

export function CustomSidebar({
  currentQuery,
  onQueryClick,
}: CustomSidebarProps) {
  const { user } = useAuth();
  const { state, toggleSidebar } = useSidebar();

  // Get the first letter of the user's name for the avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-semibold">hackathon</span>
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" passHref legacyBehavior>
              <SidebarMenuButton tooltip="Search" isActive={true}>
                <Search className="mr-2 h-4 w-4" />
                <span>Search</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-6">
          <h3 className="text-muted-foreground mb-2 px-4 text-xs font-semibold uppercase">
            Recent Searches
          </h3>
          <QueryHistory
            currentQuery={currentQuery ?? ""}
            onQueryClick={onQueryClick}
          />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={user?.image ?? ""}
                        alt={user?.name ?? "User"}
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-xs">
                      <span className="font-medium">
                        {user?.name ?? "Guest User"}
                      </span>
                      <span className="text-muted-foreground">
                        {user?.email ?? ""}
                      </span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <History className="mr-2 h-4 w-4" />
                    <span>Search History</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Floating expand button when sidebar is collapsed */}
      {state === "collapsed" && (
        <div className="fixed top-4 left-2 z-50 hidden md:flex">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-md"
            onClick={toggleSidebar}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
