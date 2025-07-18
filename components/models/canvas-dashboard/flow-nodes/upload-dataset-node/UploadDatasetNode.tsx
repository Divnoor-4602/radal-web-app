"use client";

import React, { FC, useState } from "react";
import { DatasetNodeData } from "@/lib/stores/flowStore";
import { Database, Info, File } from "lucide-react";
import CustomPills from "@/components/shared/CustomPills";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { DropzoneArea } from "./DropzoneArea";

type TUploadDatasetNodeProps = Readonly<{
  id: string;
  data: DatasetNodeData;
  selected?: boolean;
  dragging?: boolean;
}>;

export const UploadDatasetNode: FC<TUploadDatasetNodeProps> = ({
  data,
  selected,
  dragging,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUploaded = (file: File | null) => {
    setUploadedFile(file);
  };

  return (
    <div className="relative">
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
        <div className="flex flex-col mt-5 mb-6.5 px-5">
          {/* Model selector  */}
          <div className="flex flex-col gap-2.5">
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
              onFileUploaded={handleFileUploaded}
              projectId={data.projectId || ""}
              title={data.title}
              description={data.description}
            />
            {/* Extra cues regarding the format */}
            <div className="text-text-inactive text-[10px] tracking-tight font-medium">
              Supported formats: CSV
            </div>
          </div>
        </div>
        {/* Seperator */}
        <div className="bg-border-default w-full h-[1px]" />
        {/* custom pill div or state showing div */}
        <div className="flex items-center px-5 justify-end py-5">
          <CustomPills
            variant="info"
            size="default"
            className="tracking-tighter"
          >
            {uploadedFile ? (
              <div className="flex items-center">
                <File className="size-3 mr-1" />
                {uploadedFile.name}
              </div>
            ) : (
              "Select a file"
            )}
          </CustomPills>
        </div>
      </div>
    </div>
  );
};

export default UploadDatasetNode;
