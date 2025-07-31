"use client";

import React, { memo } from "react";

import ChatContent from "./chat/ChatContent";

// Assistant panel component - memoized to prevent unnecessary re-renders
const AsssitantPanel = memo(() => {
  // Chat content
  return <ChatContent />;
});

AsssitantPanel.displayName = "AsssitantPanel";

export default AsssitantPanel;
