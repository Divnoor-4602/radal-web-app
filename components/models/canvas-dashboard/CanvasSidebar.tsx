import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
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

  return (
    <Sidebar
      className={`bg-bg-100 border-r border-border-default py-4 min-h-screen ${
        isCollapsed ? "px-2" : "px-4"
      }`}
      collapsible="icon"
    >
      <SidebarHeader className="mb-4.5">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}
        >
          <Avatar className="size-8">
            <AvatarImage
              src="https://github.com/shadcn.png"
              className="rounded-full"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <p className="text-text-primary text-2xl font-bold">Radal</p>
          )}
        </div>
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
            <Collapsible
              key={item.nodeType}
              defaultOpen={item.isActive && !isCollapsed}
              className="group/collapsible w-full"
            >
              <CollapsibleTrigger asChild>
                <div className={isCollapsed ? "flex justify-center" : ""}>
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
                    <TooltipContent
                      side="right"
                      align="center"
                      className={isCollapsed ? "" : "hidden"}
                    >
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className={isCollapsed ? "mt-1" : ""}>
                {/* Content is empty when collapsed since the trigger itself is the preview node */}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </SidebarContent>
      {/* Sidebar footer */}
      <SidebarFooter>
        <div
          className={`flex items-center mt-9 ${isCollapsed ? "justify-center" : "gap-3"}`}
        >
          <Avatar className="size-10">
            <AvatarImage
              src="https://github.com/shadcn.png"
              className="rounded-full"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col">
              <p className="text-text-primary text-base font-medium tracking-tight">
                Div
              </p>
              <p className="text-text-inactive text-sm tracking-tight">
                div@gmail.com
              </p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
});

CanvasSidebar.displayName = "CanvasSidebar";

export default CanvasSidebar;
