"use client";

import React, { FC } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type TAnimatedStateListProps = {
  currentState:
    | "uploading"
    | "validating"
    | "cleaning"
    | "normalising"
    | "transforming"
    | "saving";
  shouldExit?: boolean; // Trigger exit animation when true
};

type StateItem = {
  id:
    | "uploading"
    | "validating"
    | "cleaning"
    | "normalising"
    | "transforming"
    | "saving";
  label: string;
  displayLabel: string;
};

const states: StateItem[] = [
  { id: "uploading", label: "Uploading", displayLabel: "Uploading" },
  { id: "validating", label: "Validating", displayLabel: "Validating" },
  { id: "cleaning", label: "Cleaning", displayLabel: "Cleaning" },
  { id: "normalising", label: "Normalising", displayLabel: "Normalising" },
  { id: "transforming", label: "Transforming", displayLabel: "Transforming" },
  { id: "saving", label: "Saving", displayLabel: "Saving" },
];

const AnimatedStateList: FC<TAnimatedStateListProps> = ({
  currentState,
  shouldExit = false,
}) => {
  const currentIndex = states.findIndex((state) => state.id === currentState);

  // Calculate the approximate height of the list for exit animation
  const listHeight = states.length * 30; // Approximate height per item (20px spacing + item height)

  const getStateStatus = (stateId: string, index: number) => {
    const status =
      index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "pending";
    console.log(`State ${stateId} (index ${index}): ${status}`);
    return status;
  };

  const getOpacity = (index: number) => {
    const distance = Math.abs(index - currentIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.7;
    return 0.6;
  };

  const getYOffset = (index: number) => {
    // Calculate offset to center the current item in the absolute center
    const totalItems = states.length;
    const itemSpacing = 20; // Spacing between items

    // Calculate the base offset to center the current item
    const baseOffset = (currentIndex - (totalItems - 1) / 2) * itemSpacing;

    // Position each item relative to the centered current item
    const relativePosition = (index - currentIndex) * itemSpacing;

    return relativePosition - baseOffset;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{
        opacity: shouldExit ? 0 : 1,
        y: shouldExit ? -listHeight : 0,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 h-full"
    >
      <div className="relative flex flex-col items-center gap-2 h-full">
        {states.map((state, index) => {
          const status = getStateStatus(state.id, index);
          const isCompleted = status === "completed";
          const isCurrent = status === "current";

          return (
            <motion.div
              key={state.id}
              className="flex items-center gap-2 w-full h-full"
              animate={{
                y: getYOffset(index),
                opacity: getOpacity(index),
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className={cn(
                  "relative size-4 rounded-full border-1 flex items-center justify-center flex-shrink-0 transition-colors duration-200",
                  isCompleted && "bg-success border-success-border",
                  isCurrent && "border-text-primary",
                  !isCompleted && !isCurrent && "border-text-inactive",
                )}
              >
                <Check
                  className={cn(
                    "size-2 transition-colors duration-200",
                    isCompleted && "text-text-primary",
                    isCurrent && "text-text-muted",
                    !isCompleted && !isCurrent && "text-text-inactive",
                  )}
                />
              </motion.div>
              <motion.p
                className={cn(
                  "text-sm font-medium tracking-tight transition-colors duration-200 text-left flex-1",
                  isCompleted && "text-text-primary",
                  isCurrent && "text-text-primary",
                  !isCompleted && !isCurrent && "text-text-inactive",
                )}
              >
                {isCurrent ? state.displayLabel : state.label}
              </motion.p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AnimatedStateList;
