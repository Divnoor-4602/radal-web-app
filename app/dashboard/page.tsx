import CustomButton from "@/components/shared/CustomButton";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Folders, Plus } from "lucide-react";

import React from "react";

const FoldersCustomIcon = () => {
  return (
    <>
      <div className="flex items-center justify-center size-12 bg-bg-300 border rounded-[10px] border-bg-200 project-dashboard-icon-drop-shadow project-dashboard-icon-inner-shadow">
        <Folders className="size-5 text-text-primary" />
      </div>
    </>
  );
};

const DashboardPage = () => {
  return (
    <main className="bg-bg-200 min-h-screen">
      <MaxWidthWrapper className="p-5 border-b border-border-default">
        {/* Topbar */}
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
              <p className="text-xl font-semibold text-text-primary tracking-[-0.04em]">
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
      {/* project cards */}
      <MaxWidthWrapper className="px-5 py-8">
        {/* Grid Heading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FoldersCustomIcon />
            <h1 className="text-text-primary text-3xl font-bold tracking-tighter">
              Project Dashboard
            </h1>
          </div>
          {/* Add project button */}
          <CustomButton icon={<Plus className="size-4" />} className="gap-1.5">
            Create Project
          </CustomButton>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default DashboardPage;
