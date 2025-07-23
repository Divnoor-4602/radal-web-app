"use client";

import { ArrowUp, Loader } from "lucide-react";
import { motion } from "motion/react";
import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import { processAssistantMessage } from "@/lib/actions/assistant.actions";
import { processToolInvocations } from "@/lib/utils/assistant.utils";
import {
  validateCopilotRequest,
  validateGraphState,
  type Message,
} from "@/lib/validations/assistant.schema";

const SendButton = () => {
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimized state access - only subscribe to nodes and edges
  const graphState = useFlowStore(
    useCallback(
      (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      [],
    ),
  );

  // Get graph manipulation functions
  const { updateNodeData, addNode, onNodesChange } = useFlowStore();

  // Memoize validation to avoid re-computation
  const canSend = useMemo(() => {
    if (!projectId) return false;

    const graphValidation = validateGraphState(graphState);
    return graphValidation.isValid;
  }, [projectId, graphState]);

  const handleClick = useCallback(async () => {
    // Reset error state
    setError(null);

    // Validate before sending
    if (!projectId) {
      setError("Project ID not found");
      return;
    }

    // Client-side validation
    const graphValidation = validateGraphState(graphState);
    if (!graphValidation.isValid) {
      const firstError = graphValidation.errors?.[0];
      setError(
        `Invalid graph state: ${firstError?.message || "Unknown validation error"}`,
      );
      return;
    }

    setIsLoading(true);

    try {
      // Create message with proper typing
      const userMessage: Message = {
        role: "user",
        content: "Add another upload dataset node to the graph",
      };

      // Client-side request validation
      const requestData = {
        messages: [userMessage],
        graphState,
        projectId: projectId as string,
      };

      const requestValidation = validateCopilotRequest(requestData);
      if (!requestValidation.isValid) {
        const firstError = requestValidation.errors?.[0];
        const errorMessage = `Invalid request: ${firstError?.message || "Unknown validation error"}`;
        setError(errorMessage);
        return;
      }

      // Create FormData for server action
      const formData = new FormData();
      formData.append("messages", JSON.stringify([userMessage]));
      formData.append("graphState", JSON.stringify(graphState));
      formData.append("projectId", projectId as string);

      // Call server action
      const result = await processAssistantMessage(formData);

      console.log("🤖 Assistant response:", result);

      // Handle response
      if (result && typeof result === "object" && "success" in result) {
        if (result.success) {
          console.log("✅ Success! AI Response:", result.text);
          console.log("🔧 Tool calls:", result.toolInvocations);

          // Process tool invocations using the utility function
          if (result.toolInvocations && result.toolInvocations.length > 0) {
            const toolProcessingResult = processToolInvocations(
              result.toolInvocations,
              graphState,
              {
                updateNodeData,
                addNode,
                onNodesChange,
              },
            );

            if (toolProcessingResult.success) {
              console.log(
                `🎉 Successfully processed ${toolProcessingResult.processedCount} tool invocations`,
              );
            } else {
              console.error(
                "⚠️ Some tool invocations failed:",
                toolProcessingResult.errors,
              );
              setError(
                `Tool processing errors: ${toolProcessingResult.errors.join(", ")}`,
              );
            }
          }
        } else {
          console.error("❌ Assistant error:", result.error);
          setError(result.error.message);
        }
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("❌ Failed to send message:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, graphState, updateNodeData, addNode, onNodesChange]);

  return (
    <motion.button
      onClick={handleClick}
      disabled={!canSend || isLoading}
      className={cn(
        // Base button styles from shadcn
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Icon size variant
        "size-4",
        // Custom positioning and styling
        "absolute bottom-2 right-2 border border-primary bg-primary/30 hover:bg-primary !p-3 rounded-sm cursor-pointer",
        // Disabled state
        (!canSend || isLoading) && "cursor-not-allowed",
      )}
      title={
        !canSend
          ? "Cannot send message - invalid state"
          : isLoading
            ? "Sending message..."
            : error
              ? `Error: ${error}`
              : "Send message"
      }
    >
      {isLoading ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <ArrowUp className="size-4" />
      )}
    </motion.button>
  );
};

export default SendButton;
