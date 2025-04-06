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
  const { setTheme } = useTheme() as any as ThemeContextType;

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}