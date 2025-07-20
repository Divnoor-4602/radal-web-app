"use client";

import { Label } from "@radix-ui/react-label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import SliderWithStickyLabel from "@/components/customized/slider/slider-10";
import { TEpochsSchema } from "@/lib/validations/training.schema";

type SelectEpochSliderProps = {
  labelText: string;
  tooltipText: string;
  selectedEpochs: TEpochsSchema;
  onEpochsChange: (epochs: TEpochsSchema) => void;
};

const SelectEpochSlider = ({
  labelText,
  tooltipText,
  selectedEpochs,
  onEpochsChange,
}: SelectEpochSliderProps) => {
  return (
    <>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Label className="text-text-primary text-sm ml-1">{labelText}</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-bg-100"
              arrowClassName="bg-bg-100 fill-bg-100"
            >
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <SliderWithStickyLabel
          value={selectedEpochs}
          onValueCommit={onEpochsChange}
        />
      </div>
    </>
  );
};

export default SelectEpochSlider;
