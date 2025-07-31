"use client";

import React, { memo } from "react";
import { Loader, Check, X } from "lucide-react";
import type { ToolInvocation, ToolCallStatus } from "./types";

type ToolInvocationStatusProps = {
  toolInvocation: ToolInvocation;
  toolCallStatus: ToolCallStatus;
  error?: string;
};

// Tool invocation status component for AI SDK v4
const ToolInvocationStatus = memo(
  ({ toolInvocation, toolCallStatus, error }: ToolInvocationStatusProps) => {
    const getStatusIcon = () => {
      switch (toolCallStatus) {
        case "partial-call":
          return <Loader className="size-3 animate-spin text-text-inactive" />;
        case "call":
          return <Check className="size-3 text-green-500" />;
        case "result":
          return <Check className="size-3 text-green-500" />;
        case "error":
          return <X className="size-3 text-red-500" />;
        default:
          return <Loader className="size-3 animate-spin" />;
      }
    };

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
      <div
        className={`flex flex-col gap-2 p-2 rounded-md border my-4 group shadow-md ${
          toolCallStatus === "error"
            ? "border-red-200 bg-red-50/50 hover:border-red-300"
            : "border-text-inactive/20 hover:border-text-inactive"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`text-xs font-semibold ${
              toolCallStatus === "error"
                ? "text-red-600"
                : toolCallStatus === "result"
                  ? "text-text-inactive group-hover:text-text-primary"
                  : toolCallStatus === "call" ||
                      toolCallStatus === "partial-call"
                    ? "text-text-inactive group-hover:text-text-primary animate-pulse"
                    : "text-text-inactive group-hover:text-text-primary"
            }`}
          >
            {getToolName()}
          </div>
          {getStatusIcon()}
        </div>
        {toolCallStatus === "error" && error && (
          <div className="text-xs text-red-600 bg-red-100/50 rounded p-1 border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    );
  },
);

ToolInvocationStatus.displayName = "ToolInvocationStatus";

export default ToolInvocationStatus;
