"use client";

import React, { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader, CheckCircle, XCircle, Clock } from "lucide-react";
import type { ToolCall, MessageStatus } from "@/lib/stores/chatStore";
import type { UIMessage } from "ai";

// Create a union type that accepts both UIMessage and ExtendedMessage
type AssistantMessageData = UIMessage & {
  status: MessageStatus;
  timestamp: number;
  toolCalls?: ToolCall[];
  error?: string;
};

type AssistantMessageProps = {
  message: AssistantMessageData;
  isStreaming?: boolean;
};

// Tool call status component
const ToolCallStatus = memo(({ toolCall }: { toolCall: ToolCall }) => {
  const getStatusIcon = () => {
    switch (toolCall.status) {
      case "pending":
        return <Clock className="size-3 text-yellow-500" />;
      case "executing":
        return <Loader className="size-3 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="size-3 text-green-500" />;
      case "failed":
        return <XCircle className="size-3 text-red-500" />;
      default:
        return <Clock className="size-3 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (toolCall.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "executing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg border ${getStatusColor()}`}
    >
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className="text-xs font-medium">{toolCall.toolName}</span>
        <span className="text-xs opacity-75 capitalize">{toolCall.status}</span>
      </div>
      {toolCall.result && (
        <span className="text-xs opacity-60 ml-auto">
          {typeof toolCall.result === "string"
            ? toolCall.result.slice(0, 30) + "..."
            : "Completed"}
        </span>
      )}
    </div>
  );
});

ToolCallStatus.displayName = "ToolCallStatus";

// Assistant message component with streaming and tool support
const AssistantMessage = memo(
  ({ message, isStreaming = false }: AssistantMessageProps) => {
    // Test function for Todo 5 - AssistantMessage rendering
    const testAssistantMessage = () => {
      console.log("🧪 Testing AssistantMessage...");
      console.log("📝 Message:", message);
      console.log("🔧 Tool calls:", message.toolCalls?.length || 0);
      console.log("⚡ Is streaming:", isStreaming);
    };

    return (
      <div className="flex flex-col items-start relative">
        {/* Test button for Todo 5 */}
        <button
          onClick={testAssistantMessage}
          className="absolute -top-2 -right-2 px-2 py-1 bg-cyan-500 text-white text-xs rounded hover:bg-cyan-600 z-10"
        >
          Test Assistant
        </button>

        <div className="flex items-start gap-3 w-full">
          <Avatar className="size-6 mt-1">
            <AvatarImage src="/icons/microsoft-icon.svg" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              AI
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            {/* Message content */}
            <div className="text-text-primary text-sm tracking-tight">
              {message.content}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-text-primary ml-1 animate-pulse" />
              )}
            </div>

            {/* Tool calls visualization */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-text-secondary font-medium">
                  Tool Execution:
                </div>
                <div className="space-y-1">
                  {message.toolCalls.map((toolCall) => (
                    <ToolCallStatus key={toolCall.id} toolCall={toolCall} />
                  ))}
                </div>
              </div>
            )}

            {/* Message status indicator */}
            <div className="flex items-center gap-2 text-xs text-text-inactive">
              {message.status === "streaming" && (
                <Badge variant="secondary" className="text-xs">
                  <Loader className="size-3 animate-spin mr-1" />
                  Generating...
                </Badge>
              )}
              {message.status === "completed" && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="size-3 mr-1" />
                  Completed
                </Badge>
              )}
              {message.status === "error" && (
                <Badge variant="destructive" className="text-xs">
                  <XCircle className="size-3 mr-1" />
                  Error
                </Badge>
              )}
              {message.timestamp && (
                <span className="text-xs">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AssistantMessage.displayName = "AssistantMessage";

export default AssistantMessage;
