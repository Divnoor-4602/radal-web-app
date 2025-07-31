"use client";

import React, { FC, memo, useMemo, useCallback } from "react";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropzoneArea } from "./DropzoneArea";
import { type DatasetNodeData } from "@/lib/validations/node.schema";
import useFlowStore from "@/lib/stores/flowStore";
import SelectExisitingDatasetNode from "./SelectExisitingDatasetNode";
import SelectSampleDatasets from "./SelectSampleDatasets";

// Memoized tab content components to prevent re-renders during drag
const UploadTabContent = memo<{
  nodeId: string;
  projectId: string;
  title?: string;
  description?: string;
}>(({ nodeId, projectId, title, description }) => {
  return (
    <div className="flex flex-col gap-2.5 mt-3">
      {/* label and tooltip */}
      <div className="flex items-center gap-2">
        <Label className="text-text-primary text-sm ml-1">File</Label>
        <Tooltip>
          <TooltipTrigger>
            <Info className="size-3 text-gray-500" />
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-bg-100"
            arrowClassName="bg-bg-100 fill-bg-100"
          >
            <p>Select a file to be used for tuning your model.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* file input - react dropzone implementation */}
      <DropzoneArea
        nodeId={nodeId}
        projectId={projectId}
        title={title || ""}
        description={description}
      />
      {/* Extra cues regarding the format */}
      <div className="text-text-inactive text-[10px] tracking-tight font-medium">
        Supported formats: CSV
      </div>
    </div>
  );
});

const ExistingTabContent = memo<{ nodeId: string; projectId: string }>(
  ({ nodeId, projectId }) => {
    return <SelectExisitingDatasetNode nodeId={nodeId} projectId={projectId} />;
  },
  (prevProps, nextProps) => {
    // Custom memo comparison for ExistingTabContent
    const propsChanged =
      prevProps.nodeId !== nextProps.nodeId ||
      prevProps.projectId !== nextProps.projectId;

    return !propsChanged; // Return true to prevent re-render
  },
);

const SampleTabContent = memo<{ nodeId: string }>(({ nodeId }) => {
  return (
    <div className="mt-3">
      <SelectSampleDatasets nodeId={nodeId} />
    </div>
  );
});

UploadTabContent.displayName = "UploadTabContent";
ExistingTabContent.displayName = "ExistingTabContent";
SampleTabContent.displayName = "SampleTabContent";

type DatasetTabsProps = {
  nodeId: string;
  projectId: string;
  currentData?: DatasetNodeData;
  fallbackData: DatasetNodeData;
};

export const DatasetTabs: FC<DatasetTabsProps> = memo(
  ({ nodeId, projectId, currentData, fallbackData }) => {
    const updateNodeData = useFlowStore((state) => state.updateNodeData);

    // Handler for tab changes - memoized to prevent re-creation during drag operations
    const handleTabChange = useCallback(
      (value: string) => {
        // Clear dataset selection when switching tabs to prevent visual bugs
        // where previous selection doesn't match options in the new tab
        updateNodeData(nodeId, {
          activeTab: value as "upload" | "existing" | "sample",
          azureUrl: undefined,
          storageId: undefined,
          status: undefined,
          title: currentData?.title || fallbackData.title, // Keep the original title/description
          file: undefined,
        });
      },
      [updateNodeData, nodeId, currentData?.title, fallbackData.title],
    );

    // Memoize tab content props to prevent unnecessary re-renders
    const tabContentProps = useMemo(
      () => ({
        title: currentData?.title || fallbackData.title,
        description: currentData?.description || fallbackData.description,
      }),
      [
        currentData?.title,
        fallbackData.title,
        currentData?.description,
        fallbackData.description,
      ],
    );

    return (
      <div className="flex flex-col mt-5 mb-6.5 px-5">
        {/* label and tooltip */}
        <div className="flex items-center gap-2 mb-2.5">
          <Label className="text-text-primary text-sm ml-1">Mode</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-bg-100"
              arrowClassName="bg-bg-100 fill-bg-100"
            >
              <p>Select a mode to upload your dataset.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Tab label and panel */}
        <Tabs
          className="w-full"
          value={currentData?.activeTab || fallbackData.activeTab || "upload"}
          onValueChange={handleTabChange}
        >
          <TabsList className="bg-bg-100 border-none w-full rounded-lg">
            <TabsTrigger
              value="upload"
              className="!border-none text-xs !text-text-inactive data-[state=active]:!text-text-primary data-[state=active]:!bg-[#1F1919]"
            >
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="existing"
              className="!border-none text-xs !text-text-inactive data-[state=active]:!text-text-primary data-[state=active]:!bg-[#1F1919]"
            >
              Existing
            </TabsTrigger>
            <TabsTrigger
              value="sample"
              className="!border-none text-xs !text-text-inactive data-[state=active]:!text-text-primary data-[state=active]:!bg-[#1F1919]"
            >
              Sample
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <UploadTabContent
              nodeId={nodeId}
              projectId={projectId}
              title={tabContentProps.title}
              description={tabContentProps.description}
            />
          </TabsContent>
          <TabsContent value="existing" className="mt-3">
            <ExistingTabContent
              key={`existing-${nodeId}`}
              nodeId={nodeId}
              projectId={projectId}
            />
          </TabsContent>
          <TabsContent value="sample">
            <SampleTabContent nodeId={nodeId} />
          </TabsContent>
        </Tabs>
      </div>
    );
  },
);

DatasetTabs.displayName = "DatasetTabs";

export default DatasetTabs;
