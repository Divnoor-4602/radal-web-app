"use client";

import {
  ComponentIcon,
  Database,
  BrainCog,
  Sparkles,
  LucideIcon,
} from "lucide-react";
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
import { UserButton } from "@clerk/nextjs";

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

// Custom canvas sidebar that doesn't use SidebarProvider to avoid conflicts
const ModelSidebar = memo(() => {
  return (
    <div className="bg-bg-100 border-r border-border-default py-4 px-2 min-h-screen w-20 flex flex-col">
      {/* Components icon */}
      <div className="flex items-center justify-center mb-6 mt-3">
        <ComponentIcon className="size-5 text-text-primary" strokeWidth={1.6} />
      </div>

      {/* Content */}
      <div className="flex flex-col mt-2 gap-4 items-center flex-1">
        {nodeItems.map((item) => {
          const IconComponent = item.icon;

          return (
            <Collapsible
              key={item.nodeType}
              defaultOpen={false}
              className="group/collapsible w-full"
            >
              <CollapsibleTrigger asChild>
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData(
                            "application/reactflow",
                            item.nodeType,
                          );
                          event.dataTransfer.effectAllowed = "move";
                        }}
                        className="size-10 bg-gradient-to-t from-bg-100 to-bg-400 rounded-md border border-border-default custom-project-card-drop-shadow flex items-center justify-center cursor-grab active:cursor-grabbing"
                      >
                        <IconComponent
                          className="size-5 text-text-primary"
                          strokeWidth={1.6}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1">
                {/* Content is empty when collapsed */}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center mt-9">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "size-10",
            },
          }}
        />
      </div>
    </div>
  );
});

ModelSidebar.displayName = "ModelSidebar";

export default ModelSidebar;
