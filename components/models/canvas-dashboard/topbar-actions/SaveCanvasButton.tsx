"use client";
import React, { useEffect, useState, useRef } from "react";
import useFlowStore from "@/lib/stores/flowStore";
import { Check, Loader } from "lucide-react";

const SaveCanvasButton = () => {
  const lastAutoSave = useFlowStore((state) => state.lastAutoSave);
  const [isSaving, setIsSaving] = useState(false);
  const previousAutoSaveRef = useRef(0);

  // Reset internal state when lastAutoSave becomes 0 (project switch)
  useEffect(() => {
    if (lastAutoSave === 0) {
      setIsSaving(false);
      previousAutoSaveRef.current = 0;
    }
  }, [lastAutoSave]);

  // Watch for auto-save changes
  useEffect(() => {
    if (lastAutoSave > 0 && lastAutoSave !== previousAutoSaveRef.current) {
      // Show saving state briefly
      setIsSaving(true);
      previousAutoSaveRef.current = lastAutoSave;

      // After a brief moment, show saved state
      const savingTimer = setTimeout(() => {
        setIsSaving(false);
      }, 500); // Show saving for 500ms

      return () => clearTimeout(savingTimer);
    }
  }, [lastAutoSave]);

  const getButtonContent = () => {
    if (isSaving) {
      return (
        <>
          Saving
          <Loader className="w-4 h-4 ml-2 animate-spin" />
        </>
      );
    }

    if (lastAutoSave > 0) {
      return (
        <>
          Saved
          <Check className="w-4 h-4 ml-2" />
        </>
      );
    }

    // No previous save - show idle state with no icon
    return "Idle";
  };

  return (
    <button
      disabled={lastAutoSave === 0}
      className="bg-[#1C1717] border border-border-default rounded-[10px] px-4 py-1.5 text-sm font-medium tracking-tight flex items-center justify-center opacity-75 cursor-default"
    >
      {getButtonContent()}
    </button>
  );
};

export default SaveCanvasButton;
