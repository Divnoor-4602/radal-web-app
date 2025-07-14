import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { ComponentIcon, Database, BrainCog, Sparkles } from "lucide-react";
import { PreviewNode } from "./flow-nodes/PreviewNode";
import React from "react";

const CanvasSidebar = () => {
  return (
    <Sidebar className="bg-bg-100 border-r border-border-default py-4 min-h-screen px-4">
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
        {/* Components title bar */}
        <div className="justify-between flex items-center mt-6">
          <div className="text-text-primary text-xl font-semibold tracking-tighter">
            Components
          </div>
          <ComponentIcon
            className="size-5 text-text-primary"
            strokeWidth={1.6}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-4 mt-2">
          {/* Upload dataset preview node */}
          <PreviewNode
            icon={Database}
            title="Upload Dataset"
            nodeType="dataset"
          />
          {/* Model selection preview node */}
          <PreviewNode
            icon={BrainCog}
            title="Model Selection"
            nodeType="model"
          />
          {/* Training configuration preview node */}
          <PreviewNode
            icon={Sparkles}
            title="Training Configuration"
            nodeType="training"
          />
        </div>
      </SidebarContent>
      {/* Sidebar footer */}
      <SidebarFooter>
        <div className="flex gap-3 items-center mt-9">
          <Avatar className="size-10">
            <AvatarImage
              src="https://github.com/shadcn.png"
              className="rounded-full"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-text-primary text-base font-medium tracking-tight">
              Div
            </p>
            <p className="text-text-inactive text-sm tracking-tight">
              div@gmail.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CanvasSidebar;
