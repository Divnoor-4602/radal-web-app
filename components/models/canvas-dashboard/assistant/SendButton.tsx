"use client";

import { ArrowUp, CornerDownLeft, Loader } from "lucide-react";

import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import { validateGraphState } from "@/lib/validations/assistant.schema";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SendButtonProps = {
  onSendMessage?: (content: string) => void;
  input?: string;
  isLoading?: boolean;
  disabled?: boolean;
};

const SendButton = ({
  onSendMessage,
  input = "",
  isLoading = false,
  disabled = false,
}: SendButtonProps) => {
  const { projectId } = useParams();
  const [error, setError] = useState<string | null>(null);

  // Get graph state for validation
  const graphState = useFlowStore(
    useCallback(
      (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      [],
    ),
  );

  // Memoize validation to avoid re-computation
  const canSend = useMemo(() => {
    if (!projectId || disabled || isLoading) return false;
    if (!input.trim()) return false;

    const graphValidation = validateGraphState(graphState);
    return graphValidation.isValid;
  }, [projectId, disabled, isLoading, input, graphState]);

  const handleClick = useCallback(() => {
    // Reset error state
    setError(null);

    // Validate before sending
    if (!canSend) {
      setError("Cannot send message - invalid state or empty input");
      return;
    }

    if (!onSendMessage) {
      setError("No send function provided");
      return;
    }

    // Send the current input
    onSendMessage(input);
  }, [canSend, onSendMessage, input]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          disabled={!canSend}
          className={cn(
            // Base button styles from shadcn (removed disabled:pointer-events-none to allow tooltips)
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            // Icon size variant
            "size-4",
            // Custom positioning and styling
            "absolute bottom-2 right-2 border border-primary bg-primary/30 hover:bg-primary !p-3 rounded-sm",
            // Disabled state
            !canSend ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          )}
        >
          {isLoading ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent
        className="bg-bg-400"
        arrowClassName="bg-bg-400 fill-bg-400"
      >
        <div className="flex items-center gap-1">
          <span>Send</span>
          <CornerDownLeft className="size-3" />
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default SendButton;
