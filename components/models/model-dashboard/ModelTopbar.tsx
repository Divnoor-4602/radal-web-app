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
import TrainButton from "@/components/models/canvas-dashboard/topbar-actions/Trainbutton";
import AssistantButton from "@/components/models/canvas-dashboard/topbar-actions/AssistantButton";
import useAssistantStore from "@/lib/stores/assistantStore";

type ModelTopbarProps = {
  additionalMenuItems?: React.ReactNode;
};

// Simplified canvas topbar that doesn't use SidebarProvider context
const ModelTopbar = memo(({ additionalMenuItems }: ModelTopbarProps) => {
  const router = useRouter();
  const { toggleAssistant } = useAssistantStore();

  // Memoize the back navigation handler
  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  // Memoize the assistant toggle handler
  const handleAssistantToggle = useCallback(() => {
    toggleAssistant();
  }, [toggleAssistant]);

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
    <header className="flex justify-between shrink-0 items-center gap-2 px-6 py-5 bg-bg-100 border-b border-border-default">
      {/* Back arrow and additional menu items */}
      <div className="flex items-center gap-4">
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

        {/* Additional menu items */}
        {additionalMenuItems && (
          <>
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4 bg-border-default"
            />
            {additionalMenuItems}
          </>
        )}
      </div>

      {/* Train and Assistant actions */}
      <div className="flex items-center gap-3">
        {/* Open assistant tab */}
        <AssistantButton collapseSidebarOnOpen={false} />

        {/* Start training */}
        <TrainButton />
      </div>
    </header>
  );
});

ModelTopbar.displayName = "ModelTopbar";

export default ModelTopbar;
