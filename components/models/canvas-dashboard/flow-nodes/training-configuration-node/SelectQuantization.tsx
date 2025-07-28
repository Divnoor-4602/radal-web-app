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
import { CpuIcon, Info } from "lucide-react";
import { TQuantizationSchema } from "@/lib/validations/training.schema";
import { availableQuantisations } from "@/constants";

type SelectQuantizationProps = {
  labelText: string;
  tooltipText: string;
  availableQuantisations: TQuantizationSchema[];
  type: "quantization" | "download";
  onQuantizationChange: (
    quantization: TQuantizationSchema,
    type: string,
  ) => void;
  selectedQuantization: TQuantizationSchema;
};

const SelectQuantization = memo<SelectQuantizationProps>(
  ({
    labelText,
    tooltipText,
    type,
    onQuantizationChange,
    selectedQuantization,
  }) => {
    return (
      <>
        {" "}
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
              onQuantizationChange(value as TQuantizationSchema, type)
            }
            value={selectedQuantization}
          >
            <SelectTrigger
              className={cn(
                "w-full bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>svg]:text-[#666666] [&_[data-slot=select-value]]:text-text-primary",
                selectedQuantization !== undefined
                  ? "border-[#999999]"
                  : "border-border-default",
              )}
              placeholderClassName="text-sm tracking-tight text-[#666666]"
            >
              <SelectValue
                placeholder="Select quantization"
                className="text-sm tracking-tight"
              />
            </SelectTrigger>
            <SelectContent className="bg-bg-100 border-border-default">
              {availableQuantisations.map((quantisation) => (
                <SelectItem
                  key={quantisation}
                  value={quantisation}
                  className="flex item-center gap-1 hover:bg-[#1C1717] focus:bg-[#1C1717]"
                >
                  <CpuIcon className="size-4" strokeWidth={1.5} />
                  {quantisation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </>
    );
  },
);

SelectQuantization.displayName = "SelectQuantization";

export default SelectQuantization;
