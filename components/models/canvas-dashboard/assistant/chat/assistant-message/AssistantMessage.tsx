"use client";

import React, { memo } from "react";
import type { AssistantMessageProps } from "./types";
import ToolInvocationStatus from "./ToolInvocationStatus";
import MessageStreamingStatus from "./MessageStreamingStatus";
import MemoizedMarkdown from "./MarkdownComponents";

// Assistant message component with AI SDK v5 support
const AssistantMessage = memo(({ message }: AssistantMessageProps) => {
  return (
    <div className="flex flex-col items-start relative">
      <div className="flex items-start gap-3 w-full">
        <div className="flex-1 space-y-4">
          {/* Message content with memoized markdown */}
          <div>
            <MemoizedMarkdown content={message.content} id={message.id} />
          </div>

          {/* Tool invocations visualization (AI SDK current pattern) */}
          {message.parts &&
            message.parts.some((part) => part.type === "tool-invocation") && (
              <div className="space-y-1">
                {message.parts
                  .filter((part) => part.type === "tool-invocation")
                  .map((part, index) => (
                    <ToolInvocationStatus
                      key={`${part.toolInvocation.toolCallId || index}`}
                      toolInvocation={part.toolInvocation}
                      toolCallStatus={part.toolInvocation.state}
                    />
                  ))}
              </div>
            )}
          {/* Message status indicator */}
          <MessageStreamingStatus message={message} />
        </div>
      </div>
    </div>
  );
});

AssistantMessage.displayName = "AssistantMessage";

export default AssistantMessage;
