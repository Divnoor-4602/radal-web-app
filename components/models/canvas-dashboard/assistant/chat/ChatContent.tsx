"use client";

import React, { memo, useEffect, useCallback, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import { useChatStore } from "@/lib/stores/chatStore";
import ActiveChat from "./ActiveChat";
import IntroChat from "./IntroChat";
import {
  validateCopilotRequest,
  validateGraphState,
  MessageSchema,
  type ToolInvocation,
} from "@/lib/validations/assistant.schema";
import { processToolInvocations } from "@/lib/utils/assistant.utils";

// Chat content component - memoized to prevent unnecessary re-renders
const ChatContent = memo(() => {
  const { projectId } = useParams();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get graph state and actions for tool execution
  const graphState = useFlowStore(
    useCallback((state) => ({ nodes: state.nodes, edges: state.edges }), []),
  );

  // Get graph actions for tool execution
  const graphActions = useFlowStore(
    useCallback(
      (state) => ({
        updateNodeData: state.updateNodeData,
        addNode: state.addNode,
        onNodesChange: state.onNodesChange,
        addConnection: state.addConnection,
        deleteConnection: state.deleteConnection,
      }),
      [],
    ),
  );

  // Chat store state - only for persistence
  const {
    completeStreaming,
    errorStreaming,
    addToolCall,
    updateToolCall,
    setCurrentInput,
    initializeSession,
  } = useChatStore();

  // Initialize chat session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Monitor graph changes for testing tool execution
  useEffect(() => {
    console.log("📊 Graph state changed:");
    console.log("- Nodes:", graphState.nodes.length);
    console.log("- Edges:", graphState.edges.length);
    if (graphState.nodes.length > 0) {
      console.log(
        "- Node types:",
        graphState.nodes.map((n) => `${n.type}(${n.id})`),
      );
    }
  }, [graphState.nodes.length, graphState.edges.length]);

  // Validate message content before sending
  const validateMessage = useCallback(
    (content: string): { isValid: boolean; error?: string } => {
      // Clear previous validation errors
      setValidationError(null);

      // 1. Basic content validation
      const messageResult = MessageSchema.safeParse({
        role: "user",
        content: content.trim(),
      });

      if (!messageResult.success) {
        const error =
          messageResult.error.issues[0]?.message || "Invalid message format";
        setValidationError(error);
        return { isValid: false, error };
      }

      // 2. Content length validation
      if (content.trim().length > 4000) {
        const error = "Message too long (maximum 4000 characters)";
        setValidationError(error);
        return { isValid: false, error };
      }

      // 3. Basic input sanitization check
      const sanitizedContent = content.trim().replace(/\s+/g, " ");
      if (sanitizedContent.length === 0) {
        const error = "Message cannot be empty";
        setValidationError(error);
        return { isValid: false, error };
      }

      // 4. Validate graph state if available
      const graphValidation = validateGraphState(graphState);
      if (!graphValidation.isValid) {
        console.warn("Graph state validation warning:", graphValidation.errors);
        // Don't block the message for graph issues, just log
      }

      return { isValid: true };
    },
    [graphState],
  );

  // Validate complete request before sending
  const validateRequest = useCallback(
    (content: string): { isValid: boolean; error?: string } => {
      const requestData = {
        messages: [{ role: "user", content: content.trim() }],
        graphState,
        projectId: projectId as string,
      };

      const result = validateCopilotRequest(requestData);
      if (!result.isValid) {
        const error = result.errors?.[0]?.message || "Invalid request format";
        setValidationError(error);
        return { isValid: false, error };
      }

      return { isValid: true };
    },
    [graphState, projectId],
  );

  // Use chat hook for streaming
  const {
    messages: aiMessages,
    input,
    isLoading,
    append,
  } = useChat({
    api: "/api/assistant",
    body: {
      graphState,
      projectId: projectId as string,
    },

    // Sync AI SDK messages with chat store for persistence
    onFinish: (message) => {
      console.log("🎯 Message finished:", message);
      completeStreaming();
    },

    onError: (error) => {
      console.error("❌ Chat error:", error);
      errorStreaming(error.message);
      setValidationError("Failed to send message. Please try again.");
    },

    // Handle tool calls
    onToolCall: async ({ toolCall }) => {
      console.log("🔧 Tool call received:", toolCall);
      console.log("🔍 Tool call details:", {
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        args: toolCall.args,
      });

      // Track tool calls in store for persistence
      const currentAssistantMessage = aiMessages
        .filter((msg) => msg.role === "assistant")
        .pop();

      console.log("🔍 Current assistant message:", currentAssistantMessage?.id);

      if (currentAssistantMessage) {
        console.log("📝 Adding tool call to store...");
        addToolCall(currentAssistantMessage.id, {
          toolName: toolCall.toolName,
          args: toolCall.args as Record<string, unknown>,
          status: "executing",
        });

        // Execute the tool call on the actual graph
        try {
          console.log("🚀 Starting tool execution...");

          // Type assertion needed because AI SDK toolCall args are runtime-validated
          const toolInvocation = {
            toolName: toolCall.toolName,
            args: toolCall.args,
          } as ToolInvocation;

          console.log("🔧 Calling processToolInvocations with:", {
            toolInvocation,
            graphStateNodes: graphState.nodes.length,
            graphStateEdges: graphState.edges.length,
          });

          const executionResult = processToolInvocations(
            [toolInvocation],
            graphState,
            graphActions,
          );

          console.log("📋 Tool execution result:", executionResult);

          if (executionResult.success) {
            console.log("✅ Tool executed successfully:", toolCall.toolName);
            console.log("📊 Post-execution graph state:");
            console.log("- Nodes:", graphState.nodes.length);
            console.log(
              "- Latest node added:",
              graphState.nodes[graphState.nodes.length - 1],
            );

            updateToolCall(currentAssistantMessage.id, toolCall.toolCallId, {
              status: "completed",
              result: `Successfully ${toolCall.toolName}`,
            });
          } else {
            console.error("❌ Tool execution failed:", executionResult.errors);
            updateToolCall(currentAssistantMessage.id, toolCall.toolCallId, {
              status: "failed",
              error: executionResult.errors.join(", "),
            });
          }
        } catch (error) {
          console.error("❌ Tool execution error:", error);
          updateToolCall(currentAssistantMessage.id, toolCall.toolCallId, {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return "Tool call processed";
    },
  });

  // Sync input with chat store
  useEffect(() => {
    setCurrentInput(input);
  }, [input, setCurrentInput]);

  // Send message function with validation
  const handleSendMessage = useCallback(
    (content: string) => {
      console.log("📤 Attempting to send message:", content);

      // 1. Validate message content
      const messageValidation = validateMessage(content);
      if (!messageValidation.isValid) {
        console.error("❌ Message validation failed:", messageValidation.error);
        return;
      }

      // 2. Validate complete request
      const requestValidation = validateRequest(content);
      if (!requestValidation.isValid) {
        console.error("❌ Request validation failed:", requestValidation.error);
        return;
      }

      // 3. Clear any previous errors
      setValidationError(null);

      // 4. Send the validated message
      try {
        append({
          role: "user",
          content: content.trim(),
        });
        console.log("✅ Message sent successfully");
      } catch (error) {
        console.error("❌ Failed to send message:", error);
        setValidationError("Failed to send message. Please try again.");
      }
    },
    [append, validateMessage, validateRequest],
  );

  // Use aiMessages from useChat instead of store messages for real streaming
  const hasMessages = aiMessages.length > 0;

  // Convert aiMessages to ExtendedMessage format for our components
  const displayMessages = aiMessages.map((msg) => ({
    ...msg,
    status:
      isLoading &&
      msg.role === "assistant" &&
      msg === aiMessages[aiMessages.length - 1]
        ? ("streaming" as const)
        : ("completed" as const),
    timestamp: Date.now(),
    toolCalls: [], // Tool calls will be handled by useChat internally
  }));

  // Conditionally render intro or active chat
  return (
    <div className="relative">
      {/* Test button for Add Node tool calling */}
      <button
        onClick={() => testAddNodeTool()}
        className="absolute top-2 left-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 z-50"
      >
        🧪 Test Add Node Tool
      </button>

      {hasMessages ? (
        <ActiveChat
          messages={displayMessages}
          input={input}
          isLoading={isLoading}
          validationError={validationError}
        />
      ) : (
        <IntroChat
          onSendMessage={handleSendMessage}
          validationError={validationError}
        />
      )}
    </div>
  );

  // Test function for Add Node tool calling
  function testAddNodeTool() {
    console.log("🧪 Testing Add Node Tool Calling...");
    console.log("📊 Initial graph state:");
    console.log("- Nodes:", graphState.nodes.length);
    console.log("- Edges:", graphState.edges.length);

    // Test processToolInvocations function directly
    console.log("🔧 Testing processToolInvocations function...");
    try {
      const testToolInvocation = {
        toolName: "addNode" as const,
        args: {
          nodeType: "model" as const,
          position: { x: 400, y: 300 },
        },
      } as ToolInvocation;

      console.log("🧪 Direct tool execution test:", testToolInvocation);
      const directResult = processToolInvocations(
        [testToolInvocation],
        graphState,
        graphActions,
      );
      console.log("🧪 Direct execution result:", directResult);
    } catch (error) {
      console.error("❌ Direct tool execution failed:", error);
    }

    // Send a message that should trigger the addNode tool
    const testMessage =
      "Add a model node to my pipeline at position (400, 300)";
    console.log("📤 Sending test message:", testMessage);

    handleSendMessage(testMessage);

    // Log expectations
    console.log("🎯 Expected behavior:");
    console.log("1. AI should generate an addNode tool call");
    console.log("2. Tool should be executed and modify the graph");
    console.log("3. New model node should appear on canvas");
    console.log("4. Tool execution status should show in chat");
  }
});

ChatContent.displayName = "ChatContent";

export default ChatContent;
