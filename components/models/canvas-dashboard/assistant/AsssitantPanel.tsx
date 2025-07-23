"use client";

import React, { memo } from "react";
import useAssistantStore from "@/lib/stores/assistantStore";

// Assistant panel component - memoized to prevent unnecessary re-renders
const AsssitantPanel = memo(() => {
  // use sidebar hook
  const isOpen = useAssistantStore((state) => state.isOpen);

  console.log("isOpen", isOpen);

  // Assistant panel
  return (
    <div className="w-full h-full bg-bg-100 flex flex-col">
      <div className="flex-1 p-4">
        <p className="text-text-muted">Assistant panel is now working!</p>
        <p className="text-sm text-text-muted mt-2">
          Toggle state: {isOpen ? "Open" : "Closed"}
        </p>
      </div>
    </div>
  );
});

AsssitantPanel.displayName = "AsssitantPanel";

export default AsssitantPanel;
