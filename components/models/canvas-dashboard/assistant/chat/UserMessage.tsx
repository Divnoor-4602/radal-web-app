"use client";

import React, { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserMessageProps = {
  content: string;
};

// User message component
const UserMessage = memo(({ content }: UserMessageProps) => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-3">
        <Avatar className="size-6">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="text-text-primary text-sm font-medium tracking-tight">
          {content}
        </div>
      </div>
    </div>
  );
});

UserMessage.displayName = "UserMessage";

export default UserMessage;
