"use client";

import React, { FC, memo } from "react";
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

const AnimatedStateList: FC<TAnimatedStateListProps> = memo(
  ({ currentState }) => {
    const currentIndex = states.findIndex((state) => state.id === currentState);

    const getStateStatus = (stateId: string, index: number) => {
      const status =
        index < currentIndex
          ? "completed"
          : index === currentIndex
            ? "current"
            : "pending";
      return status;
    };

    const getOpacity = (index: number) => {
      const distance = Math.abs(index - currentIndex);
      if (distance === 0) return 1;
      if (distance === 1) return 0.7;
      return 0.4;
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
      <div className="flex flex-col items-center">
        <div className="relative flex flex-col items-center gap-2 h-full">
          {states.map((state, index) => {
            const status = getStateStatus(state.id, index);
            const isCompleted = status === "completed";
            const isCurrent = status === "current";

            return (
              <motion.div
                key={state.id}
                className="flex items-center gap-2 h-full w-full"
                animate={{
                  y: getYOffset(index),
                  opacity: getOpacity(index),
                }}
                transition={{
                  duration: 0.3,
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
      </div>
    );
  },
);

AnimatedStateList.displayName = "AnimatedStateList";

export default AnimatedStateList;
