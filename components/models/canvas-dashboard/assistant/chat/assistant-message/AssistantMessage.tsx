"use client";

import React, { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Loader,
  CheckCircle,
  XCircle,
  Check,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { marked } from "marked";
import type { UIMessage } from "ai";

// Message status type for streaming from streamText
type MessageStatus =
  | "submitted" // waiting to start
  | "streaming" // waiting for tool results
  | "completed" // finished successfully
  | "error"; // user cancelled

// Tool call status type
type ToolCallStatus =
  | "partial-call" // tool call is in progress
  | "call" // tool call is completed
  | "result"; // tool call result is available

// Tool call result -> result after a tool has been called
type ToolCallResult =
  | "success" // tool call completed successfully
  | "error" // tool call failed
  | "timeout" // tool call timed out
  | "invalid"; // tool call was invalid

// Tool invocation type for AI SDK v5
type ToolInvocation = {
  toolCallId?: string;
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
};

// Message type that matches AI SDK v5 patterns
type AssistantMessageData = UIMessage & {
  status?: MessageStatus;
  timestamp?: number;
  error?: string;
};

type AssistantMessageProps = {
  message: AssistantMessageData;
  isStreaming?: boolean;
};

// Tool invocation status component for AI SDK v4
const ToolInvocationStatus = memo(
  ({
    toolInvocation,
    toolCallStatus,
  }: {
    toolInvocation: ToolInvocation;
    toolCallStatus: ToolCallStatus;
  }) => {
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

// Message streaming status
const MessageStreamingStatus = memo(
  ({ message }: { message: AssistantMessageData }) => {
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

// Memoized markdown components for performance optimization during streaming
function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const CustomH1 = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-3xl font-bold tracking-tight">{children}</h1>;
};

const CustomH2 = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-2xl font-bold tracking-tight">{children}</h2>;
};

const CustomH3 = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="text-xl font-bold">{children}</h3>;
};

const CustomP = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm">{children}</p>;
};

const CustomLi = ({ children }: { children: React.ReactNode }) => {
  return <li className="text-sm my-2">{children}</li>;
};

const CustomHr = () => {
  return <hr className="border-t-2 border-bg-100" />;
};

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        className="prose prose-sm max-w-none dark:prose-invert"
        components={{
          h1: CustomH1,
          h2: CustomH2,
          h3: CustomH3,
          p: CustomP,
          li: CustomLi,
          hr: CustomHr,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  },
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return (
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
        ))}
      </div>
    );
  },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

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
