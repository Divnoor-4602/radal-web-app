"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Package, Info } from "lucide-react";
import { TBatchSizeSchema } from "@/lib/validations/training.schema";
import { availbleBatchSizes } from "@/constants";

type SelectBatchSizeProps = {
  labelText: string;
  tooltipText: string;
  onBatchSizeChange: (batchSize: TBatchSizeSchema) => void;
  selectedBatchSize: TBatchSizeSchema;
};

const SelectBatchSize = memo<SelectBatchSizeProps>(
  ({ labelText, tooltipText, onBatchSizeChange, selectedBatchSize }) => {
    return (
      <>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Label className="text-text-primary text-sm ml-1">
              {labelText}
            </Label>
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
          <Select
            onValueChange={(value) =>
              onBatchSizeChange(value as TBatchSizeSchema)
            }
            value={selectedBatchSize}
          >
            <SelectTrigger
              className={cn(
                "w-full bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>svg]:text-[#666666] [&_[data-slot=select-value]]:text-text-primary",
                selectedBatchSize !== undefined
                  ? "border-[#999999]"
                  : "border-border-default",
              )}
              placeholderClassName="text-sm tracking-tight text-[#666666]"
            >
              <SelectValue
                placeholder="Select batch size"
                className="text-sm tracking-tight"
              />
            </SelectTrigger>
            <SelectContent className="bg-bg-100 border-border-default">
              {availbleBatchSizes.map((batchSize) => (
                <SelectItem
                  key={batchSize}
                  value={batchSize}
                  className="flex item-center gap-1"
                >
                  <Package className="size-4" strokeWidth={1.5} />
                  {batchSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </>
    );
  },
);

SelectBatchSize.displayName = "SelectBatchSize";

export default SelectBatchSize;
