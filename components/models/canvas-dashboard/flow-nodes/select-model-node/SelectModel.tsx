"use client";

import React from "react";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image, { StaticImageData } from "next/image";
import CustomPills from "@/components/shared/CustomPills";
import { cn } from "@/lib/utils";

type ModelType = {
  display_name: string;
  model_id: string;
  description: string;
  parameters: string;
  provider: string;
  providerIcon: StaticImageData;
  tags: string[];
};

type SelectModelProps = {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  availableModels?: Record<string, ModelType>;
};

export const SelectModel: React.FC<SelectModelProps> = ({
  selectedModelId,
  onModelChange,
  availableModels,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      {/* label and tooltip */}
      <div className="flex items-center gap-2">
        <Label className="text-text-primary text-sm ml-1">Model Provider</Label>
        <Tooltip>
          <TooltipTrigger>
            <Info className="size-3 text-gray-500" />
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-bg-100"
            arrowClassName="bg-bg-100 fill-bg-100"
          >
            <p>Select the model provider for your fine-tune.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Select onValueChange={onModelChange} value={selectedModelId}>
        <SelectTrigger
          className={cn(
            "w-full bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>svg]:text-[#666666] [&_[data-slot=select-value]]:text-text-primary",
            selectedModelId !== ""
              ? "border-[#999999]"
              : "border-border-default",
          )}
          placeholderClassName="text-sm tracking-tight text-[#666666]"
        >
          <SelectValue
            placeholder="Select a model"
            className="text-sm tracking-tight"
          />
        </SelectTrigger>
        <SelectContent className="bg-bg-100 border-border-default">
          {Object.values(availableModels || {}).map((model, index) => (
            <SelectItem
              key={index}
              value={model.model_id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-1">
                <Image
                  src={model.providerIcon}
                  alt={model.provider}
                  width={20}
                  height={20}
                  priority
                />
              </div>
              <div className="flex items-center gap-3">
                {model.provider} {model.display_name}
                <CustomPills
                  variant="info"
                  size="sm"
                  className="tracking-tighter py-0 px-1 text-[4px]"
                >
                  {model.parameters}
                </CustomPills>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectModel;
