"use client";

import React, { memo, useState, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import useFlowStore from "@/lib/stores/flowStore";
import type { DatasetNodeData } from "@/lib/validations/node.schema";

type SelectExistingDatasetNodeProps = {
  nodeId: string;
  projectId: string;
};

const SelectExisitingDatasetNode: React.FC<SelectExistingDatasetNodeProps> =
  memo(({ nodeId, projectId }) => {
    // Use specific selector to avoid re-renders on other store changes
    const updateNodeData = useFlowStore((state) => state.updateNodeData);

    // Get the current node data to check if a dataset is already selected
    const currentNodeData = useFlowStore(
      (state) =>
        state.nodes.find((node) => node.id === nodeId)?.data as DatasetNodeData,
    );

    const [isOpen, setIsOpen] = useState(false);

    // Derive selected dataset ID from flow store instead of local state
    const selectedDatasetId = currentNodeData?.storageId || "";

    // Query datasets - Convex automatically caches results
    const datasets = useQuery(api.datasets.getProjectDatasets, {
      projectId: projectId as Id<"projects">,
    });

    const handleDatasetChange = useCallback(
      (datasetId: string) => {
        const selectedDataset = datasets?.find((d) => d._id === datasetId);
        if (selectedDataset) {
          // Update node data with the same structure as DropzoneArea
          updateNodeData(nodeId, {
            azureUrl: selectedDataset.storageUrl,
            storageId: selectedDataset._id, // Use dataset ID as storage reference
            status: "success",
            title: selectedDataset.title,
            file: selectedDataset.originalFilename,
          });
        }
      },
      [datasets, nodeId, updateNodeData],
    );

    const handleOpenChange = useCallback((open: boolean) => {
      setIsOpen(open);
    }, []);

    const isLoading = isOpen && datasets === undefined;
    const hasDatasets = datasets && datasets.length > 0;

    return (
      <div className="flex flex-col gap-2.5">
        {/* label and tooltip */}
        <div className="flex items-center gap-2">
          <Label className="text-text-primary text-sm ml-1">
            Existing Dataset
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
              <p>Select a previously uploaded dataset from this project.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Select
          onValueChange={handleDatasetChange}
          value={selectedDatasetId}
          onOpenChange={handleOpenChange}
        >
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
              placeholder="Select a dataset"
              className="text-sm tracking-tight"
            />
          </SelectTrigger>
          <SelectContent
            className={cn(
              "bg-bg-100 border-border-default",
              hasDatasets && datasets.length > 5
                ? "max-h-[200px] overflow-y-auto"
                : "",
            )}
          >
            {isLoading ? (
              // Show skeleton while loading
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              ))
            ) : !hasDatasets ? (
              <div className="p-2 text-center text-text-muted text-sm">
                No datasets found for this project
              </div>
            ) : (
              datasets.map((dataset) => (
                <SelectItem
                  key={dataset._id}
                  value={dataset._id}
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
                      {dataset.rowCount || 0} rows
                    </CustomPills>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    );
  });

SelectExisitingDatasetNode.displayName = "SelectExisitingDatasetNode";

export default SelectExisitingDatasetNode;
