"use client";

import React, { memo } from "react";
import type { AssistantMessageData } from "./types";

type MessageStreamingStatusProps = {
  message: AssistantMessageData;
};

// Message streaming status
const MessageStreamingStatus = memo(
  ({ message }: MessageStreamingStatusProps) => {
    console.log(message.status);

    const getStatusText = () => {
      switch (message.status) {
        case "submitted":
          return "Thinking";
        case "streaming":
          return "Thinking";
        case "completed":
          return "Completed";
        case "error":
          return "Error";
      }
    };

    // styling for status text
    const getStatusTextStyle = () => {
      switch (message.status) {
        case "submitted":
          return "text-text-inactive animate-pulse";
        case "streaming":
          return "text-text-inactive animate-pulse";
        case "completed":
          return "text-text-inactive";
        case "error":
          return "text-red-700";
      }
    };

    return (
      <div className={`text-xs ${getStatusTextStyle()} mb-2`}>
        <div className="flex items-center gap-2">
          {getStatusText()}
          {/* show a bouncing dot animation if the model is in intiial or loading */}
          {getStatusText() === "Thinking" && (
            <div className="flex items-center gap-1 mt-1 animate-pulse">
              <div className="size-[3px] bg-text-inactive rounded-full animate-bounce" />
              <div className="size-[3px] bg-text-inactive rounded-full animate-bounce delay-100" />
              <div className="size-[3px] bg-text-inactive rounded-full animate-bounce delay-200" />
            </div>
          )}
        </div>
      </div>
    );
  },
);

MessageStreamingStatus.displayName = "MessageStreamingStatus";

export default MessageStreamingStatus;
