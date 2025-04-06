"use client";

import { UserAvatar } from "@/components/user-avatar";
import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import {
  CustomDropdownMenu,
  CustomDropdownMenuContent,
  CustomDropdownMenuItem,
  CustomDropdownMenuSeparator,
  CustomDropdownMenuTrigger,
} from "@/components/ui/custom-dropdown";

interface UserMenuProps {
  user: Pick<User, "name" | "image" | "email">;
}

export function UserMenu({ user }: UserMenuProps) {
  // Add client-side only rendering to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until after client-side hydration
  if (!mounted) {
    return null;
  }

  return (
    <CustomDropdownMenu>
      <CustomDropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white transition-colors hover:bg-transparent">
          <UserAvatar user={user} size="sm" />
          <span className="font-medium">{user.name}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      </CustomDropdownMenuTrigger>
      <CustomDropdownMenuContent
        align="end"
        className="w-65 border-0 bg-black/90"
        sideOffset={5}
      >
        <div className="flex items-center gap-2 p-2">
          <UserAvatar user={user} size="sm" />
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium text-white">{user.name}</p>
            {user.email && (
              <p className="text-xs text-gray-400">{user.email}</p>
            )}
          </div>
        </div>
        <CustomDropdownMenuSeparator className="bg-gray-800" />
        <CustomDropdownMenuItem
          asChild
          className="focus:bg-gray-800 focus:text-white"
        >
          <Link href="/nodes" className="w-full cursor-pointer">
            My Nodes
          </Link>
        </CustomDropdownMenuItem>
        <CustomDropdownMenuItem
          asChild
          className="focus:bg-gray-800 focus:text-white"
        >
          <Link href="/settings" className="w-full cursor-pointer">
            Settings
          </Link>
        </CustomDropdownMenuItem>
        <CustomDropdownMenuSeparator className="bg-gray-800" />
        <CustomDropdownMenuItem
          className="w-full cursor-pointer text-red-400 focus:bg-gray-800 focus:text-red-300"
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            void signOut({ callbackUrl: "/login" });
          }}
        >
          Sign out
        </CustomDropdownMenuItem>
      </CustomDropdownMenuContent>
    </CustomDropdownMenu>
  );
}
