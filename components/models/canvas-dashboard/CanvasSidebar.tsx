"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ComponentIcon,
  Database,
  BrainCog,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { PreviewNode } from "./flow-nodes/PreviewNode";
import React, { memo } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";

const nodeItems: {
  title: string;
  icon: LucideIcon;
  nodeType: string;
  isActive: boolean;
}[] = [
  {
    title: "Upload Dataset",
    icon: Database,
    nodeType: "dataset",
    isActive: true,
  },
  {
    title: "Model Selection",
    icon: BrainCog,
    nodeType: "model",
    isActive: true,
  },
  {
    title: "Training Configuration",
    icon: Sparkles,
    nodeType: "training",
    isActive: true,
  },
];

const CanvasSidebar = memo(() => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Fetch current user data
  const currentUser = useQuery(api.users.current);

  return (
    <Sidebar
      className={`bg-bg-100 border-r border-border-default py-4 min-h-screen ${
        isCollapsed ? "px-2" : "px-4"
      }`}
      collapsible="icon"
    >
      <SidebarHeader className="mb-4.5">
        <Link href="/dashboard" className="cursor-pointer">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}
          >
            <Image
              src="/radal-logo.png"
              alt="Radal Logo"
              width={28}
              height={28}
              priority
              className="drop-shadow"
            />
            {!isCollapsed && (
              <p className="text-text-primary text-2xl font-bold">Radal</p>
            )}
          </div>
        </Link>
        {/* divider */}
        <div className="bg-black w-full h-[1px] mt-4.5 custom-divider-drop-shadow" />
        {/* Components title bar */}
        <div
          className={`flex items-center mt-6 ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          {!isCollapsed && (
            <div className="text-text-primary text-xl font-semibold tracking-tighter">
              Components
            </div>
          )}
          <ComponentIcon
            className="size-5 text-text-primary"
            strokeWidth={1.6}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div
          className={`flex flex-col mt-2 ${isCollapsed ? "gap-4 items-center" : "gap-4"}`}
        >
          {nodeItems.map((item) => (
            <div key={item.nodeType} className="w-full">
              {isCollapsed ? (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <PreviewNode
                          icon={item.icon}
                          title={item.title}
                          nodeType={item.nodeType}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <Collapsible
                  defaultOpen={item.isActive}
                  className="group/collapsible w-full"
                >
                  <CollapsibleTrigger asChild>
                    <div>
                      <PreviewNode
                        icon={item.icon}
                        title={item.title}
                        nodeType={item.nodeType}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {/* Content is empty when collapsed since the trigger itself is the preview node */}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          ))}
        </div>
      </SidebarContent>
      {/* Sidebar footer */}
      <SidebarFooter>
        {/* settings and avatar */}
        <div className="flex gap-3 items-center mt-9">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-10",
              },
            }}
          />
          {!isCollapsed && (
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
                  <p className="text-text-primary text-sm font-medium tracking-tight">
                    {currentUser?.name.split(" ")[0]}
                  </p>
                  <p className="text-text-inactive text-xs tracking-tight">
                    {currentUser?.email}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
});

CanvasSidebar.displayName = "CanvasSidebar";

export default CanvasSidebar;
