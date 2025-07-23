"use client";

import React, { useCallback, memo } from "react";
import { Sparkles } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { useSidebar } from "@/components/ui/sidebar";
import useAssistantStore from "@/lib/stores/assistantStore";

// Assistant button component - memoized to prevent unnecessary re-renders
const AssistantButton = memo(() => {
  // use sidebar hook
  const { setOpen: setSidebarOpen } = useSidebar();

  // Assistant state subscription - only actions, no re-render causing subscriptions
  const { toggleAssistant } = useAssistantStore();

  // Toggle the assistant window
  const handleAssistantClick = useCallback(() => {
    // collapse the sidebar to make space for the assistant
    setSidebarOpen(false);
    // toggle the assistant window
    console.log("toggleAssistant");
    toggleAssistant();
  }, [setSidebarOpen, toggleAssistant]);

  return (
    <CustomButton
      text="Assistant"
      icon={<Sparkles className="size-4" strokeWidth={1.6} />}
      className="gap-1.5"
      variant="tertiary"
      onClick={handleAssistantClick}
    />
  );
});

AssistantButton.displayName = "AssistantButton";

export default AssistantButton;
