"use client";

import React, { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/clerk-react";

type UserMessageProps = {
  content: string;
};

// User message component
const UserMessage = memo(({ content }: UserMessageProps) => {
  const { user } = useUser();

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-3">
        <Avatar className="size-6">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-text-primary text-sm font-semibold">{content}</div>
      </div>
    </div>
  );
});

UserMessage.displayName = "UserMessage";

export default UserMessage;
