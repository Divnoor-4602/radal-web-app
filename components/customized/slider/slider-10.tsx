"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { TEpochsSchema } from "@/lib/validations/training.schema";

type SliderWithStickyLabelProps = {
  value: TEpochsSchema;
  onValueCommit: (value: TEpochsSchema) => void;
};

export default function SliderWithStickyLabel({
  value,
  onValueCommit,
}: SliderWithStickyLabelProps) {
  const [localValue, setLocalValue] = useState([value]);
  const [isHovered, setIsHovered] = useState(false);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue([value]);
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    setLocalValue(newValue);
  };

  const handleValueCommit = (newValue: number[]) => {
    onValueCommit(newValue[0] as TEpochsSchema);
  };

  return (
    <div className="relative w-full flex flex-col items-center max-w-sm">
      <SliderPrimitive.Root
        value={localValue}
        min={1}
        max={5}
        step={1}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-border-default">
          <SliderPrimitive.Range className="absolute h-full bg-text-primary/70" />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
          className="block h-4 w-4 rounded-full border border-border-default bg-bg-100 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated hover label */}
          <Badge
            className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 -top-4 bg-bg-100 text-text-primary border-border-default text-xs transition-all duration-200 ease-in-out ${
              isHovered
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            {localValue[0]}
          </Badge>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  );
}
