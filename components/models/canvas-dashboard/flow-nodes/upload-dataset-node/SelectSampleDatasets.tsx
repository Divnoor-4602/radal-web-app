"use client";

import React, { memo, useCallback } from "react";
import { File, Info } from "lucide-react";
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
import CustomPills from "@/components/shared/CustomPills";
import { cn } from "@/lib/utils";
import useFlowStore from "@/lib/stores/flowStore";
import type { DatasetNodeData } from "@/lib/validations/node.schema";
import { sampleDatasets } from "@/constants";

type SelectSampleDatasetsProps = {
  nodeId: string;
};

const SelectSampleDatasets: React.FC<SelectSampleDatasetsProps> = memo(
  ({ nodeId }) => {
    // Use specific selector to avoid re-renders on other store changes
    const updateNodeData = useFlowStore((state) => state.updateNodeData);

    // Get the current node data to check if a dataset is already selected
    const currentNodeData = useFlowStore(
      (state) =>
        state.nodes.find((node) => node.id === nodeId)?.data as DatasetNodeData,
    );

    // Derive selected dataset ID from flow store instead of local state
    const selectedDatasetId = currentNodeData?.storageId || "";

    const handleDatasetChange = useCallback(
      (datasetId: string) => {
        const selectedDataset = sampleDatasets.find((d) => d.id === datasetId);
        if (selectedDataset) {
          // Update node data with the same structure as other dataset components
          updateNodeData(nodeId, {
            azureUrl: selectedDataset.azureUrl,
            storageId: selectedDataset.id, // Use sample dataset ID as storage reference
            status: selectedDataset.status,
            title: selectedDataset.title,
            file: selectedDataset.file,
          });
        }
      },
      [nodeId, updateNodeData],
    );

    return (
      <div className="flex flex-col gap-2.5">
        {/* label and tooltip */}
        <div className="flex items-center gap-2">
          <Label className="text-text-primary text-sm ml-1">
            Sample Datasets
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
              <p>
                Choose from pre-built sample datasets to get started quickly.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Select onValueChange={handleDatasetChange} value={selectedDatasetId}>
          <SelectTrigger
            className={cn(
              "w-full bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>svg]:text-[#666666] [&_[data-slot=select-value]]:text-text-primary",
              selectedDatasetId !== ""
                ? "border-[#999999]"
                : "border-border-default",
            )}
            placeholderClassName="text-sm tracking-tight text-[#666666]"
          >
            <SelectValue
              placeholder="Select a sample dataset"
              className="text-sm tracking-tight"
            />
          </SelectTrigger>
          <SelectContent
            className={cn(
              "bg-bg-100 border-border-default",
              sampleDatasets.length > 5 ? "max-h-[200px] overflow-y-auto" : "",
            )}
          >
            {sampleDatasets.map((dataset) => (
              <SelectItem
                key={dataset.id}
                value={dataset.id}
                className="flex items-center justify-between hover:bg-[#1C1717] focus:bg-[#1C1717]"
              >
                <div className="flex items-center gap-2 w-full">
                  <File className="size-4 text-text-primary flex-shrink-0" />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-text-primary text-sm truncate">
                      {dataset.title}
                    </span>
                  </div>
                  <CustomPills
                    variant="neutral"
                    size="sm"
                    className="tracking-tighter py-[1px] px-2 text-[10px] ml-2 flex-shrink-0"
                  >
                    {dataset.rowCount.toLocaleString()} rows
                  </CustomPills>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
);

SelectSampleDatasets.displayName = "SelectSampleDatasets";

export default SelectSampleDatasets;
