import React from "react";
import { TrainingNodeData } from "@/lib/stores/flowStore";
import { Sparkles, Info } from "lucide-react";
import CustomPills from "@/components/shared/CustomPills";
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
import { cn } from "@/lib/utils";

interface TrainingConfigurationNodeProps {
  id: string;
  data: TrainingNodeData;
  selected?: boolean;
  dragging?: boolean;
}

export const TrainingConfigurationNode: React.FC<
  TrainingConfigurationNodeProps
> = ({
  // id, // TODO: Use id when needed
  data,
  selected,
  dragging,
}) => {
  return (
    <>
      <div className="relative">
        {/* Main card */}
        <div
          className={`relative pt-4.5 bg-gradient-to-t from-bg-100 to-bg-400 w-full max-w-[400px] rounded-2xl border custom-project-card-drop-shadow to-[120%] from-[-15%] ${
            selected ? "border-border-highlight" : "border-border-default"
          } ${dragging ? "opacity-70" : ""}`}
        >
          {/* Card header */}
          <div className="px-5">
            <div className="flex items-center gap-3">
              {/* icon */}
              <Sparkles className="size-5 text-text-primary" />
              <h2 className="text-base font-medium tracking-tighter text-text-primary">
                {data.title}
              </h2>
            </div>
            {/* Card description */}
            <div className="text-text-muted text-xs mt-4">
              Train with the default settings or customize them, then select the
              model download format.
            </div>
          </div>
          {/* Seperator */}
          <div className="bg-border-default w-full h-[1px] my-5" />
          {/* Card content */}
          <div className="flex flex-col mt-5 mb-6.5 px-5 space-y-4">
            {/* Quantization Select */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Label className="text-text-primary text-sm ml-1">
                  Quantization
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
                    <p>Select the quantization level for your model.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select>
                <SelectTrigger
                  className={cn(
                    "w-full bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>svg]:text-[#666666] [&_[data-slot=select-value]]:text-text-primary border-border-default",
                  )}
                  placeholderClassName="text-sm tracking-tight text-[#666666]"
                >
                  <SelectValue
                    placeholder="Select quantization"
                    className="text-sm tracking-tight"
                  />
                </SelectTrigger>
                <SelectContent className="bg-bg-100 border-border-default">
                  <SelectItem value="4bit">4-bit</SelectItem>
                  <SelectItem value="8bit">8-bit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Epochs Select */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Label className="text-text-primary text-sm ml-1">Epochs</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="size-3 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-bg-100"
                    arrowClassName="bg-bg-100 fill-bg-100"
                  >
                    <p>Number of training epochs for your model.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select>
                <SelectTrigger
                  className={cn(
                    "w-full bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>svg]:text-[#666666] [&_[data-slot=select-value]]:text-text-primary border-border-default",
                  )}
                  placeholderClassName="text-sm tracking-tight text-[#666666]"
                >
                  <SelectValue
                    placeholder="Select epochs"
                    className="text-sm tracking-tight"
                  />
                </SelectTrigger>
                <SelectContent className="bg-bg-100 border-border-default">
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Download Type Select */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Label className="text-text-primary text-sm ml-1">
                  Download Type
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
                    <p>Choose the format for downloading your trained model.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select>
                <SelectTrigger
                  className={cn(
                    "w-full bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>svg]:text-[#666666] [&_[data-slot=select-value]]:text-text-primary border-border-default",
                  )}
                  placeholderClassName="text-sm tracking-tight text-[#666666]"
                >
                  <SelectValue
                    placeholder="Select download type"
                    className="text-sm tracking-tight"
                  />
                </SelectTrigger>
                <SelectContent className="bg-bg-100 border-border-default">
                  <SelectItem value="safetensors">SafeTensors</SelectItem>
                  <SelectItem value="gguf">GGUF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Seperator */}
          <div className="bg-border-default w-full h-[1px]" />
          {/* Status pill */}
          <div className="flex items-center px-5 justify-end py-5">
            <CustomPills
              variant="success"
              size="default"
              className="tracking-tighter text-[8px]"
            >
              Training
            </CustomPills>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrainingConfigurationNode;
