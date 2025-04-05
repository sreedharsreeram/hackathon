"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Simple context for sidebar state
interface SidebarContextProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function Sidebar({ 
  children, 
  className 
}: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebar();
  
  return (
    <div 
      className={cn(
        "h-full bg-sidebar border-r transition-all duration-300 ease-in-out",
        collapsed ? "w-[60px]" : "w-[250px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SidebarHeader({ 
  children, 
  className 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
}

export function SidebarContent({ 
  children, 
  className 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-2", className)}>
      {children}
    </div>
  );
}

export function SidebarGroup({ 
  children, 
  className 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({ 
  children, 
  className 
}: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebar();
  
  return (
    <div className={cn(
      "text-sm font-medium mb-2 flex items-center", 
      collapsed ? "justify-center" : "px-2",
      className
    )}>
      {children}
    </div>
  );
}

export function SidebarMenu({ 
  children, 
  className 
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("space-y-1", className)}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({ 
  children, 
  className 
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("", className)}>
      {children}
    </li>
  );
}

export function SidebarMenuButton({ 
  children, 
  className,
  isActive,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean }) {
  const { collapsed } = useSidebar();
  
  return (
    <button
      className={cn(
        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground font-medium" : "text-foreground",
        collapsed ? "justify-center items-center flex" : "",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarTrigger({ 
  onClick,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { collapsed, setCollapsed } = useSidebar();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCollapsed(!collapsed);
    if (onClick) onClick(e);
  };
  
  return (
    <button
      className={cn(
        "p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {props.children ?? (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <path d="M9 3v18" />
        </svg>
      )}
    </button>
  );
}
