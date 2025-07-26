"use client";

import React, { useCallback, memo } from "react";
import { CommandIcon, Sparkles } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { useSidebar } from "@/components/ui/sidebar";
import useAssistantStore from "@/lib/stores/assistantStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Assistant button component - memoized to prevent unnecessary re-renders
const AssistantButton = memo(() => {
  // use sidebar hook
  const { setOpen: setSidebarOpen } = useSidebar();

  // Assistant state subscription - only actions, no re-render causing subscriptions
  const { toggleAssistant, isOpen: isAssistantOpen } = useAssistantStore();

  // Toggle the assistant window
  const handleAssistantClick = useCallback(() => {
    // collapse the sidebar to make space for the assistant
    setSidebarOpen(false);
    // toggle the assistant window
    console.log("toggleAssistant");
    toggleAssistant();
  }, [setSidebarOpen, toggleAssistant]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CustomButton
          text="Assistant"
          icon={<Sparkles className="size-4" strokeWidth={1.6} />}
          className="gap-1.5"
          variant="tertiary"
          onClick={handleAssistantClick}
          isActive={isAssistantOpen}
        />
      </TooltipTrigger>
      <TooltipContent
        className="bg-bg-400"
        arrowClassName="bg-bg-400 fill-bg-400"
      >
        <div className="text-xs flex items-center gap-2">
          <span>Open assistant</span>
          <div className="flex items-center gap-1">
            <CommandIcon className="size-3" />
            <span>i</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

AssistantButton.displayName = "AssistantButton";

export default AssistantButton;
