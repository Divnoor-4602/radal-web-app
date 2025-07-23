"use client";

import React, { memo } from "react";
import useAssistantStore from "@/lib/stores/assistantStore";
import { Textarea } from "@/components/ui/textarea";
import SendButton from "./SendButton";

const pillSuggestions: string[] = [
  "Explain my pipeline",
  "Choose a model for my dataset",
  "Change model settings",
];

// Assistant panel component - memoized to prevent unnecessary re-renders
const AsssitantPanel = memo(() => {
  // use sidebar hook
  const isOpen = useAssistantStore((state) => state.isOpen);

  console.log("isOpen", isOpen);

  // Assistant panel
  return (
    <div className="w-full h-full bg-bg-100 flex flex-col items-center justify-center">
      {/* Assistant Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-xl w-full flex flex-col items-center">
          {/* Title */}
          <h2 className="text-2xl mb-6 font-text-primary tracking-tight font-medium">
            How can I assist you?
          </h2>

          {/* Text area section */}
          <div className="w-full mb-6">
            <div className="relative w-full">
              <Textarea
                className="w-full !outline-0 !ring-0 !focus:ring-0 !focus-visible:ring-0 !shadow-none !bg-[#1B1B1D] !border !border-stone-800 focus:!ring-0 focus:!ring-offset-0 focus:!border-border-default placeholder:text-text-inactive !min-h-20 text-sm pr-12 pb-12"
                placeholder="Ask me anything..."
              />
              {/* send button */}
              <SendButton />
            </div>
          </div>

          {/* Suggestion pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {pillSuggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="h-auto py-1 px-3 text-[12px] text-text-primary rounded-full border-border-default hover:!border-border-highlight bg-bg-300 border cursor-pointer"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

AsssitantPanel.displayName = "AsssitantPanel";

export default AsssitantPanel;
