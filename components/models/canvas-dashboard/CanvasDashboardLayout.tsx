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
import React, { useCallback, memo } from "react";
import CanvasSidebar from "@/components/models/canvas-dashboard/CanvasSidebar";
import { ArrowLeft, BrainCircuit, Sparkles } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { useRouter, useParams } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import {
  validateTrainingFlow,
  getConnectedTrainingNodes,
  transformFlowToTrainingSchema,
} from "@/lib/utils/train.utils";
import { startTraining } from "@/lib/actions/train.actions";
import { type TrainingSchemaDataServer } from "@/lib/validations/train.server.schema";

// Canvas specific topbar/breadcrumb - memoized to prevent unnecessary re-renders
const CanvasTopbarWithActions = memo(() => {
  const router = useRouter();
  const params = useParams();

  // Memoize the train click handler with stable reference - access store inside function
  const handleTrainClick = useCallback(async () => {
    try {
      // Access current state inside the function to avoid dependencies on volatile arrays
      const { nodes, edges } = useFlowStore.getState();

      // Validate the training flow
      const validation = validateTrainingFlow(nodes, edges);

      if (!validation.isValid) {
        console.error("Invalid training flow:", validation.errors);
        // TODO: Show user-friendly error message
        return;
      }

      // Collect and validate connected nodes
      const connectedNodes = getConnectedTrainingNodes(nodes, edges);

      if (!connectedNodes.isValid) {
        console.error("Invalid connected nodes:", connectedNodes.errors);
        // TODO: Show user-friendly error message
        return;
      }

      // Transform to training schema format
      const transformResult = transformFlowToTrainingSchema(nodes, edges);
      console.log("Training schema transformation:", transformResult);

      if (!transformResult.success) {
        console.error(
          "Failed to transform training schema:",
          transformResult.errors,
        );
        // TODO: Show user-friendly error message
        return;
      }

      console.log("✅ Successfully transformed to training schema!");
      console.log("Training schema data:", transformResult.data);

      // Ensure we have the transformed data
      if (!transformResult.data) {
        console.error("No transformed data available");
        return;
      }

      // Extract projectId from URL params
      const projectId = params.projectId as string;
      if (!projectId) {
        console.error("Project ID not found in URL params");
        return;
      }

      console.log("🚀 Starting training with:", {
        projectId,
        datasetCount: transformResult.data.datasetNodes.length,
      });

      // Call the server action
      // TODO: Handle loading states and show live updates while training is in progress
      const result = await startTraining({
        trainingData: transformResult.data! as TrainingSchemaDataServer, // Type cast
        projectId,
      });

      console.log("Training result:", result);
    } catch (error) {
      console.error("Training failed:", error);
    }
  }, []); // No dependencies - stable reference

  // Memoize the back navigation handler
  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

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
              onClick={handleBackClick}
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
});

CanvasTopbarWithActions.displayName = "CanvasTopbarWithActions";

// Main canvas dashboard layout - memoized to prevent unnecessary re-renders
const CanvasDashboardLayout = memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "400px",
            "--sidebar-width-icon": "5rem",
          } as React.CSSProperties
        }
      >
        <CanvasSidebar />
        <SidebarInset className="flex flex-col bg-white">
          <CanvasTopbarWithActions />
          {/* canvas */}
          <main className="flex-1 min-h-0 bg-bg-100">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  },
);

CanvasDashboardLayout.displayName = "CanvasDashboardLayout";

export default CanvasDashboardLayout;
