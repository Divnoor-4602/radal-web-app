"use client";

import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { footerMenuItems } from "@/constants";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Gauge, Brain, Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

const ProjectSidebar = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pathname = usePathname();
  const router = useRouter();

  // Fetch models for this project
  const models = useQuery(api.models.getModelsByProject, {
    projectId: projectId as Id<"projects">,
  });

  // Fetch current user data
  const currentUser = useQuery(api.users.current);

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
              {/* Always show Dashboard item */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/projects/${projectId}`}
                  className={
                    pathname === `/projects/${projectId}`
                      ? " border-black border px-4 py-4.5 data-[active=true]:bg-bg-300 custom-active-menu-drop-shadow custom-active-menu-inner-shadow rounded-lg"
                      : ""
                  }
                >
                  <Link
                    href={`/projects/${projectId}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Gauge
                      className={`size-5 ${
                        pathname === `/projects/${projectId}`
                          ? "text-text-primary"
                          : "text-text-inactive"
                      }`}
                    />
                    <span
                      className={`text-base font-medium tracking-[-0.04em] ${
                        pathname === `/projects/${projectId}`
                          ? "text-text-primary"
                          : "text-text-inactive"
                      }`}
                    >
                      Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Show model items or loading skeletons */}
              {models === undefined ? (
                // Show skeleton placeholders while models are loading
                <>
                  {Array.from({ length: 2 }).map((_, index) => (
                    <SidebarMenuItem key={`skeleton-${index}`}>
                      <Skeleton className="w-full h-[40px] rounded-xl bg-bg-200" />
                    </SidebarMenuItem>
                  ))}
                </>
              ) : models.length === 0 ? (
                // Show empty state when no models exist
                <SidebarMenuItem>
                  <Button
                    className="w-full cursor-pointer bg-bg-100 text-text-primary hover:bg-bg-400/50 border-bg-400 border flex items-center gap-1.5"
                    onClick={() => {
                      router.push(`/projects/${projectId}/models/new/canvas`);
                    }}
                  >
                    <Plus className="size-4" />
                    Create Model
                  </Button>
                </SidebarMenuItem>
              ) : (
                // Show actual model menu items
                models.map((model) => (
                  <SidebarMenuItem key={model._id}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname ===
                        `/projects/${projectId}/models/${model._id}`
                      }
                      className={
                        pathname ===
                        `/projects/${projectId}/models/${model._id}`
                          ? " border-black border px-4 py-4.5 data-[active=true]:bg-bg-300 custom-active-menu-drop-shadow custom-active-menu-inner-shadow rounded-xl"
                          : ""
                      }
                    >
                      <Link
                        href={`/projects/${projectId}/models/${model._id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Brain
                          className={`size-5 ${
                            pathname ===
                            `/projects/${projectId}/models/${model._id}`
                              ? "text-text-primary"
                              : "text-text-inactive"
                          }`}
                        />
                        <span
                          className={`text-base font-medium tracking-[-0.04em] ${
                            pathname ===
                            `/projects/${projectId}/models/${model._id}`
                              ? "text-text-primary"
                              : "text-text-inactive"
                          }`}
                        >
                          {model.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Sidebar footer */}
      <SidebarFooter>
        <SidebarMenu className="flex flex-col gap-4">
          {footerMenuItems.map((item, index) => (
            <SidebarMenuItem key={item.title + index}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                className={
                  item.isActive
                    ? " border-black border px-4 py-4.5 data-[active=true]:bg-bg-300 custom-active-menu-drop-shadow custom-active-menu-inner-shadow rounded-xl"
                    : ""
                }
              >
                <Link
                  href={item.url}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <item.icon
                    className={`size-5 ${
                      item.isActive ? "text-text-primary" : "text-text-inactive"
                    }`}
                  />
                  <span
                    className={`text-base font-medium tracking-[-0.04em] ${
                      item.isActive ? "text-text-primary" : "text-text-inactive"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {/* settings and avatar */}
        <div className="flex gap-3 items-center mt-9">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-10",
              },
            }}
          />
          <div className="flex flex-col">
            {currentUser === undefined ? (
              // Show skeleton for user info while loading
              <>
                <Skeleton className="w-20 h-4 bg-bg-200 mb-1" />
                <Skeleton className="w-32 h-3 bg-bg-200" />
              </>
            ) : (
              // Show actual user info
              <>
                <p className="text-text-primary text-base font-medium tracking-tight">
                  {currentUser?.name}
                </p>
                <p className="text-text-inactive text-sm tracking-tight">
                  {currentUser?.email}
                </p>
              </>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ProjectSidebar;
