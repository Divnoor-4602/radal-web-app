import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@clerk/nextjs";

const ProjectSidebarLoading = () => {
  return (
    <Sidebar className="bg-bg-100 border-r border-[#262626] py-4 min-h-screen px-5">
      <SidebarHeader className="mb-4.5">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage
              src="https://github.com/shadcn.png"
              className="rounded-full"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="text-text-primary text-2xl font-bold">Radal</p>
        </div>
        {/* divider */}
        <div className="bg-black w-full h-[1px] mt-4.5 custom-divider-drop-shadow" />
      </SidebarHeader>
      <SidebarContent className="mt-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-6">
              {/* Dashboard menu item skeleton */}
              <SidebarMenuItem>
                <Skeleton className="w-full h-[40px] rounded-xl bg-bg-200" />
              </SidebarMenuItem>
              {/* Model menu items skeletons */}
              {Array.from({ length: 3 }).map((_, index) => (
                <SidebarMenuItem key={index}>
                  <Skeleton className="w-full h-[40px] rounded-xl bg-bg-200" />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Sidebar footer */}
      <SidebarFooter>
        <SidebarMenu className="flex flex-col gap-4">
          {/* Help Centre skeleton */}
          <SidebarMenuItem>
            <Skeleton className="w-full h-[40px] rounded-xl bg-bg-200" />
          </SidebarMenuItem>
          {/* Settings skeleton */}
          <SidebarMenuItem>
            <Skeleton className="w-full h-[40px] rounded-xl bg-bg-200" />
          </SidebarMenuItem>
        </SidebarMenu>
        {/* settings and avatar skeleton */}
        <div className="flex gap-3 items-center mt-9">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-10",
              },
            }}
          />
          <div className="flex flex-col">
            <Skeleton className="w-20 h-4 bg-bg-200 mb-1" />
            <Skeleton className="w-32 h-3 bg-bg-200" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ProjectSidebarLoading;
