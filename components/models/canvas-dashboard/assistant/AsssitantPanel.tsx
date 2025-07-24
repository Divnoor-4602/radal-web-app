"use client";

import React, { memo } from "react";
import useAssistantStore from "@/lib/stores/assistantStore";
import ChatContent from "./chat/ChatContent";

// Assistant panel component - memoized to prevent unnecessary re-renders
const AsssitantPanel = memo(() => {
  // use sidebar hook
  const isOpen = useAssistantStore((state) => state.isOpen);

  console.log("isOpen", isOpen);

  // Chat content
  return <ChatContent />;
});

AsssitantPanel.displayName = "AsssitantPanel";

export default AsssitantPanel;
