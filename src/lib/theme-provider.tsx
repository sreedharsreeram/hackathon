"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Simple wrapper around next-themes provider
export function ThemeProvider({ children, ...props }: React.PropsWithChildren<any>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Custom hook to use theme
export function useTheme() {
  // This is a simple wrapper to make TypeScript happy
  const [theme, setTheme] = React.useState<string | undefined>(undefined);
  
  React.useEffect(() => {
    // Only import and use next-themes on the client side
    if (typeof window !== "undefined") {
      import("next-themes").then((mod) => {
        const { useTheme } = mod;
        const themeContext = useTheme();
        if (themeContext && themeContext.theme) {
          setTheme(themeContext.theme);
        }
      });
    }
  }, []);
  
  const changeTheme = React.useCallback((newTheme: string) => {
    // Only import and use next-themes on the client side
    if (typeof window !== "undefined") {
      import("next-themes").then((mod) => {
        const { useTheme } = mod;
        const themeContext = useTheme();
        if (themeContext && typeof themeContext.setTheme === "function") {
          themeContext.setTheme(newTheme);
          setTheme(newTheme);
        }
      });
    }
  }, []);
  
  return {
    theme,
    setTheme: changeTheme,
  };
}
