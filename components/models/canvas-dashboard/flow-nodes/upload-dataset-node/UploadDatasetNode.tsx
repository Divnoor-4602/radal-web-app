"use client";

import React, { FC, memo, useMemo } from "react";
import { Database, File } from "lucide-react";
import { Position } from "@xyflow/react";
import CustomPills from "@/components/shared/CustomPills";
import { type DatasetNodeData } from "@/lib/validations/node.schema";
import useFlowStore from "@/lib/stores/flowStore";
import CustomHandle from "@/components/models/canvas-dashboard/handles/CustomHandle";
import DatasetTabs from "./DatasetTabs";

type TUploadDatasetNodeProps = Readonly<{
  id: string;
  data: DatasetNodeData;
  selected?: boolean;
  dragging?: boolean;
}>;

export const UploadDatasetNode: FC<TUploadDatasetNodeProps> = memo(
  ({ id, data, selected, dragging }) => {
    // Use separate selectors to avoid object recreation issues (same pattern as SelectModelNode)
    const currentData = useFlowStore(
      (state) =>
        state.nodes.find((node) => node.id === id)?.data as DatasetNodeData,
    );

    // Extract just the projectId to avoid re-renders on unrelated data changes
    const projectId = useMemo(() => {
      const result = currentData?.projectId || data.projectId || "";

      return result;
    }, [currentData?.projectId, data.projectId]);

    // Memoize CustomHandle data to prevent object recreation during drag operations
    const handleData = useMemo(
      () => ({
        nodeId: id,
        dataType: "dataset" as const,
        payload: {
          format: "csv" as const,
          status: currentData?.file
            ? ("ready" as const)
            : ("processing" as const),
        },
      }),
      [id, currentData?.file],
    );

    return (
      <div className="relative">
        {/* CustomHandle on the right side */}
        <CustomHandle
          type="source"
          position={Position.Right}
          id="upload-dataset-output"
          colorTheme="purple"
          size="md"
          data={handleData}
        />

        {/* Main card */}
        <div
          className={`relative pt-4.5 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[400px] rounded-2xl border border-border-default custom-project-card-drop-shadow to-[120%] from-[-15%] ${
            selected ? "border-border-highlight" : ""
          } ${dragging ? "opacity-70" : ""}`}
        >
          {/* Card header */}
          <div className="px-5">
            <div className="flex items-center gap-3">
              {/* icon */}
              <Database className="size-5 text-text-primary" />
              <h2 className="text-base font-medium tracking-tighter text-text-primary">
                Upload Dataset
              </h2>
            </div>
            {/* Card description */}
            <div className="text-text-muted text-xs mt-4">
              Upload your CSV to be used for tuning your model.
            </div>
          </div>
          {/* Seperator */}
          <div className="bg-border-default w-full h-[1px] my-5" />
          {/* Card content */}
          <DatasetTabs
            nodeId={id}
            projectId={projectId}
            currentData={currentData}
            fallbackData={data}
          />
          {/* Seperator */}
          <div className="bg-border-default w-full h-[1px]" />
          {/* custom pill div or state showing div */}
          <div className="flex items-center px-5 justify-end py-5">
            {currentData?.file ? (
              <CustomPills
                variant="success"
                size="default"
                className="tracking-tighter"
              >
                <div className="flex items-center">
                  <File className="size-3 mr-1" />
                  {typeof currentData.file === "string"
                    ? currentData.file
                    : currentData.file.name}
                </div>
              </CustomPills>
            ) : (
              <CustomPills
                variant="info"
                size="default"
                className="tracking-tighter"
              >
                Select a file
              </CustomPills>
            )}
          </div>
        </div>
      </div>
    );
  },
);

UploadDatasetNode.displayName = "UploadDatasetNode";

export default UploadDatasetNode;
