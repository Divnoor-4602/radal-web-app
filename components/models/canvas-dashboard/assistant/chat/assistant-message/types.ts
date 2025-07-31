import type { UIMessage } from "ai";

// Message status type for streaming from streamText
export type MessageStatus =
  | "submitted" // waiting to start
  | "streaming" // waiting for tool results
  | "completed" // finished successfully
  | "error"; // user cancelled

// Tool call status type
export type ToolCallStatus =
  | "partial-call" // tool call is in progress
  | "call" // tool call is completed
  | "result" // tool call result is available
  | "error"; // tool call error

// Tool invocation type for AI SDK v4
export type ToolInvocation = {
  toolCallId?: string;
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
};

// Message type that matches AI SDK v5 patterns
export type AssistantMessageData = UIMessage & {
  status?: MessageStatus;
  timestamp?: number;
  error?: string;
};

export type AssistantMessageProps = {
  message: AssistantMessageData;
  isStreaming?: boolean;
};
