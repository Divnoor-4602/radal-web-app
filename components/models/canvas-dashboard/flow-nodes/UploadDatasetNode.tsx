"use client";

import React from "react";
import { motion } from "motion/react";
import { DatasetNodeData } from "@/lib/stores/flowStore";
import { Database, Info } from "lucide-react";
import CustomPills from "@/components/shared/CustomPills";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useDropzone } from "react-dropzone";

interface UploadDatasetNodeProps {
  id: string;
  data: DatasetNodeData;
}

const AnimatedImages = () => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className="w-16 h-16 relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Green CSV - stays in center */}
      <motion.img
        src="/images/csv-green.svg"
        alt="CSV Green"
        className="size-10 absolute"
        initial={{ scale: 1, rotate: 0 }}
        animate={{
          scale: isHovered ? 1.1 : 1,
          zIndex: 3,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Red CSV - pops out to the left with rotation */}
      <motion.img
        src="/images/csv-red.svg"
        alt="CSV Red"
        className="size-10 absolute"
        initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
        animate={{
          x: isHovered ? -20 : 0,
          y: isHovered ? -5 : 0,
          rotate: isHovered ? -15 : 0,
          scale: isHovered ? 0.9 : 1,
          zIndex: 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Blue CSV - pops out to the right with rotation */}
      <motion.img
        src="/images/csv-blue.svg"
        alt="CSV Blue"
        className="size-10 absolute"
        initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
        animate={{
          x: isHovered ? 20 : 0,
          y: isHovered ? -5 : 0,
          rotate: isHovered ? 15 : 0,
          scale: isHovered ? 0.9 : 1,
          zIndex: 2,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export const UploadDatasetNode: React.FC<UploadDatasetNodeProps> = (
  {
    // id, // TODO: Use id when needed
    // data, // TODO: Use data when needed
  },
) => {
  const onDrop = (acceptedFiles: File[]) => {
    console.log("Uploaded files:", acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <div className="relative">
      {/* Main card */}
      <div className="relative pt-4.5 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[400px] rounded-2xl border border-border-default custom-project-card-drop-shadow to-[120%] from-[-15%]">
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
            <div
              {...getRootProps()}
              className={`
                border-1 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors min-h-[200px] flex items-center justify-center bg-[#1C1717] border-border-default
                ${isDragActive ? "" : ""}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                {/* Add the images or the svgs here */}
                <div>
                  <AnimatedImages />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive ? (
                    <p>Drop the files here...</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <p className="text-text-inactive text-xs tracking-tight font-medium">
                        Drag & drop your file here
                      </p>
                      <p className="text-text-muted text-[10px] tracking-tight font-medium">
                        Choose a file
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
            Select a file
          </CustomPills>
        </div>
      </div>
    </div>
  );
};

export default UploadDatasetNode;
