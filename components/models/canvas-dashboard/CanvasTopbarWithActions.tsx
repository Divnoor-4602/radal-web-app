"use client";

import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import React, { useCallback, memo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import TrainButton from "@/components/models/canvas-dashboard/topbar-actions/Trainbutton";
import AssistantButton from "@/components/models/canvas-dashboard/topbar-actions/AssistantButton";
import useAssistantStore from "@/lib/stores/assistantStore";

// Canvas specific topbar/breadcrumb - memoized to prevent unnecessary re-renders
const CanvasTopbarWithActions = memo(() => {
  const router = useRouter();
  const { setOpen: setSidebarOpen } = useSidebar();
  const { toggleAssistant } = useAssistantStore();

  // Memoize the back navigation handler
  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  // Memoize the assistant toggle handler
  const handleAssistantToggle = useCallback(() => {
    // collapse the sidebar to make space for the assistant
    setSidebarOpen(false);
    // toggle the assistant window
    toggleAssistant();
  }, [setSidebarOpen, toggleAssistant]);

  // Add keyboard shortcut for assistant toggle (Cmd+I on macOS, Ctrl+I on Windows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+I (macOS) or Ctrl+I (Windows/Linux)
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleAssistantToggle();
      }
    };

    // Add event listener to document
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleAssistantToggle]);

  return (
    <header className="flex justify-between shrink-0 items-center gap-2 px-6 py-5  bg-bg-100 border-b border-border-default">
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
        <AssistantButton />

        {/* Start training */}
        <TrainButton />
      </div>
    </header>
  );
});

CanvasTopbarWithActions.displayName = "CanvasTopbarWithActions";

export default CanvasTopbarWithActions;
