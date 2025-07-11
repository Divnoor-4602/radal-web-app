import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import React from "react";

const DashboardPage = () => {
  return (
    <main className="bg-bg-200">
      <MaxWidthWrapper className=" min-h-screen p-5">
        {/* Topbar */}
        <div className="p-5 flex justify-between items-center">
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
              <p className="text-xs text-text-muted">
                Wednesday, July 10th 2024
              </p>
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
      </MaxWidthWrapper>
    </main>
  );
};

export default DashboardPage;
