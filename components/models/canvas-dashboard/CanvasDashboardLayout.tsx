"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import React, { memo } from "react";
import CanvasSidebar from "@/components/models/canvas-dashboard/CanvasSidebar";
import CanvasTopbarWithActions from "@/components/models/canvas-dashboard/CanvasTopbarWithActions";
import AssistantPanel from "@/components/models/canvas-dashboard/assistant/AsssitantPanel";
import useAssistantStore from "@/lib/stores/assistantStore";

// Main canvas dashboard layout - memoized to prevent unnecessary re-renders
const CanvasDashboardLayout = memo(
  ({ children }: { children: React.ReactNode }) => {
    // Subscribe to assistant state for layout changes
    const isAssistantOpen = useAssistantStore((state) => state.isOpen);

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
        </SidebarInset>
      </SidebarProvider>
    );
  },
);

CanvasDashboardLayout.displayName = "CanvasDashboardLayout";

export default CanvasDashboardLayout;
