"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import React, { memo } from "react";
import ModelSidebar from "@/components/models/model-dashboard/ModelSidebar";
import ModelTopbar from "@/components/models/model-dashboard/ModelTopbar";
import AssistantPanel from "@/components/models/canvas-dashboard/assistant/AsssitantPanel";
import useAssistantStore from "@/lib/stores/assistantStore";

// Model dashboard layout that doesn't use SidebarProvider to avoid conflicts
const ModelDashboardLayout = memo(
  ({
    children,
    additionalMenuItems,
  }: {
    children: React.ReactNode;
    additionalMenuItems?: React.ReactNode;
  }) => {
    // Subscribe to assistant state for layout changes
    const isAssistantOpen = useAssistantStore((state) => state.isOpen);

    return (
      <div className="flex h-full bg-white">
        {/* Model Sidebar - Fixed width, no SidebarProvider */}
        <ModelSidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0">
          <ModelTopbar additionalMenuItems={additionalMenuItems} />

          {/* Main content area with resizable panels */}
          <ResizablePanelGroup
            direction="horizontal"
            className="flex-1 min-h-0"
          >
            {/* Canvas area */}
            <ResizablePanel defaultSize={60} minSize={30}>
              <main className="h-full bg-bg-100">{children}</main>
            </ResizablePanel>

            {/* Always present, but conditionally visible */}
            <ResizableHandle
              withHandle
              className={
                isAssistantOpen ? "border-border-default border-l" : "hidden"
              }
            />
            <ResizablePanel
              defaultSize={40}
              minSize={20}
              maxSize={40}
              className={isAssistantOpen ? "block" : "hidden"}
            >
              <AssistantPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    );
  },
);

ModelDashboardLayout.displayName = "ModelDashboardLayout";

export default ModelDashboardLayout;
