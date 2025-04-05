"use client";

import { useEffect, useState, createContext, useContext } from "react";
import type { ReactNode } from "react";

// Define the User type based on the NextAuth session
interface User {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
}

// Define the session type
interface Session {
  user?: User;
  expires?: string;
}

// Create a context for the authentication state
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap around components that need auth
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the session from the API route
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json() as Session;
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
