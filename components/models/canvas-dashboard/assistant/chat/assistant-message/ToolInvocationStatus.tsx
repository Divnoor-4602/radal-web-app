"use client";

import React, { memo } from "react";
import { Loader, Check } from "lucide-react";
import type { ToolInvocation, ToolCallStatus } from "./types";

type ToolInvocationStatusProps = {
  toolInvocation: ToolInvocation;
  toolCallStatus: ToolCallStatus;
};

// Tool invocation status component for AI SDK v4
const ToolInvocationStatus = memo(
  ({ toolInvocation, toolCallStatus }: ToolInvocationStatusProps) => {
    const getStatusIcon = () => {
      switch (toolCallStatus) {
        case "partial-call":
          return <Loader className="size-3 animate-spin text-text-inactive" />;
        case "call":
          return <Check className="size-3 text-green-500" />;
        case "result":
          return <Check className="size-3 text-green-500" />;
        default:
          return <Loader className="size-3 animate-spin" />;
      }
    };

    console.log(toolInvocation);

    const getToolName = () => {
      switch (toolInvocation.toolName) {
        case "updateNodeProperties":
          return "Update Node";
        case "addNode":
          return "Add Node";
        case "deleteNode":
          return "Delete Node";
        case "addConnection":
          return "Add Connection";
        case "deleteConnection":
          return "Delete Connection";
        default:
          return toolInvocation.toolName;
      }
    };

    return (
      <div className="flex items-center gap-2 p-2 rounded-md border border-text-inactive/20 my-4 group hover:border-text-inactive">
        <div className="flex items-center gap-2">
          <div
            className={`text-text-inactive text-xs font-semibold group-hover:text-text-primary ${
              toolCallStatus === "result"
                ? ""
                : toolCallStatus === "call" || toolCallStatus === "partial-call"
                  ? "animate-pulse"
                  : ""
            }`}
          >
            {getToolName()}
          </div>
          {getStatusIcon()}
        </div>
      </div>
    );
  },
);

ToolInvocationStatus.displayName = "ToolInvocationStatus";

export default ToolInvocationStatus;
