import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React from "react";

const Topbar = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Avatar className="size-10">
          <AvatarImage
            src="https://github.com/shadcn.png"
            className="rounded-full"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-2xl font-semibold text-text-primary tracking-[-0.04em]">
            Good Morning, Div 👋
          </p>
          <p className="text-sm text-text-muted">Wednesday, July 10th 2024</p>
        </div>
      </div>
      <Avatar className="size-10">
        <AvatarImage
          src="https://github.com/shadcn.png"
          className="rounded-full"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default Topbar;
