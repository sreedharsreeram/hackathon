"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check if window exists (client-side only)
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      
      // Initial check
      setMatches(media.matches);
      
      // Create listener function
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Add the listener
      media.addEventListener("change", listener);
      
      // Clean up
      return () => {
        media.removeEventListener("change", listener);
      };
    }
    
    // Default to false on server or if window is undefined
    return () => {};
  }, [query]);
  
  return matches;
}