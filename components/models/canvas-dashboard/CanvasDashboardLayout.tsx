"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import React from "react";
import CanvasSidebar from "@/components/models/canvas-dashboard/CanvasSidebar";
import { ArrowLeft, BrainCircuit, Sparkles } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { useRouter } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import { startTraining } from "@/lib/actions/training.actions";

// Canvas specific topbar/breadcrumb
const CanvasTopbarWithActions = () => {
  const router = useRouter();
  const { nodes, edges } = useFlowStore();

  const handleTrainClick = async () => {
    try {
      console.log("Starting training with nodes:", nodes);
      console.log("Starting training with edges:", edges);

      const result = await startTraining(nodes, edges);
      console.log("Training result:", result);
    } catch (error) {
      console.error("Training failed:", error);
    }
  };

  return (
    <header className="flex justify-between shrink-0 items-center gap-2 px-6 py-5 bg-bg-100 border-b border-border-default">
      {/* Sidebar and back arrow actions */}
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="-ml-1 text-text-muted hover:text-text-primary cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent
            className="bg-bg-400"
            arrowClassName="bg-bg-400 fill-bg-400"
          >
            Toggle sidebar
          </TooltipContent>
        </Tooltip>
        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-4 bg-border-default"
        />
        {/* Go back to the previous page */}
        <Tooltip>
          <TooltipTrigger asChild>
            <ArrowLeft
              className="size-5 text-text-muted cursor-pointer hover:text-text-primary"
              onClick={() => router.back()}
            />
          </TooltipTrigger>
          <TooltipContent
            className="bg-bg-400"
            arrowClassName="bg-bg-400 fill-bg-400"
          >
            Go back to previous page
          </TooltipContent>
        </Tooltip>
      </div>
      {/* Train and Assistant actions */}
      <div className="flex items-center gap-3">
        {/* Open assistant tab */}
        <CustomButton
          text="Assistant"
          icon={<Sparkles className="size-4" strokeWidth={1.6} />}
          className="gap-1.5"
          variant="tertiary"
        />
        {/* Start training */}
        <CustomButton
          text="Train"
          icon={<BrainCircuit className="size-4" strokeWidth={1.6} />}
          className="gap-1.5"
          onClick={handleTrainClick}
        />
      </div>
    </header>
  );
};

// Main canvas dashboard layout
const CanvasDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "400px" } as React.CSSProperties}
    >
      <CanvasSidebar />
      <SidebarInset className="flex flex-col bg-white">
        <CanvasTopbarWithActions />
        {/* canvas */}
        <main className="flex-1 min-h-0 bg-bg-100">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default CanvasDashboardLayout;
