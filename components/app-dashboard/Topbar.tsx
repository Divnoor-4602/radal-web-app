"use client";

import React from "react";
import { useConvexAuth } from "convex/react";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  getFirstName,
  getTimeBasedGreeting,
  getCurrentFormattedDate,
} from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

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
        <Link href="/dashboard" className="cursor-pointer">
          <Image
            src="/radal-logo.png"
            alt="Radal Logo"
            width={40}
            height={40}
            priority
            className="rounded-[4px]"
          />
        </Link>
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
