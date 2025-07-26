"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React from "react";
import { useConvexAuth } from "convex/react";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  getFirstName,
  getTimeBasedGreeting,
  getCurrentFormattedDate,
} from "@/lib/utils";

const Topbar = () => {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();

  const displayName =
    isAuthenticated && user
      ? getFirstName(user.fullName || user.firstName)
      : "User";

  const greeting = getTimeBasedGreeting();
  const currentDate = getCurrentFormattedDate();

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Avatar className="size-10">
          <AvatarImage
            src={user?.imageUrl || "https://github.com/shadcn.png"}
            className="rounded-full"
          />
          <AvatarFallback>
            {user?.firstName?.[0] || "U"}
            {user?.lastName?.[0] || "N"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-2xl font-semibold text-text-primary tracking-[-0.04em]">
            {greeting}, {displayName} 👋
          </p>
          <p className="text-sm text-text-muted">{currentDate}</p>
        </div>
      </div>
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "size-10",
          },
        }}
      />
    </div>
  );
};

export default Topbar;
