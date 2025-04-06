"use client";

import type { User } from "next-auth";
import Image from "next/image";

interface UserAvatarProps {
  user: Pick<User, "name" | "image">;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 56,
  };

  const pixelSize = sizeMap[size];

  return (
    <div
      className={`relative overflow-hidden rounded-full bg-blue-600`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name ?? "User avatar"}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
      )}
    </div>
  );
}
