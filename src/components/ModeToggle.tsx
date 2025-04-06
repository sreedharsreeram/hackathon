"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
// Use type assertion to bypass TypeScript errors
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define a type for the theme context
interface ThemeContextType {
  theme?: string;
  setTheme: (theme: string) => void;
}

export function ModeToggle() {
  const [mounted, setMounted] = useState(false);
  
  // Only render the toggle on the client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use type assertion to bypass TypeScript errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { theme, setTheme } = useTheme() as any as ThemeContextType;

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative overflow-hidden"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent" : ""}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}