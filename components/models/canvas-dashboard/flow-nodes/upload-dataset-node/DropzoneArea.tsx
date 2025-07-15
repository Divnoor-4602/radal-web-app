"use client";

import React, { FC, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { AnimatedImages } from "./AnimatedImages";
import { validateCSVFileAndContent } from "@/lib/validations/csv.schema";

interface DropzoneAreaProps {
  onFilesUploaded?: (files: File[]) => void;
}

export const DropzoneArea: FC<DropzoneAreaProps> = ({ onFilesUploaded }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const onDrop = async (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[],
  ) => {
    setError(null);
    setIsValidating(true);

    // Handle rejected files from dropzone
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      setError(rejection.errors[0]?.message || "File rejected");
      setIsValidating(false);
      return;
    }

    // Validate accepted files
    if (acceptedFiles.length === 0) {
      setError("No files selected");
      setIsValidating(false);
      return;
    }

    try {
      const file = acceptedFiles[0]; // Single file only

      // Use new CSV validation
      const validation = await validateCSVFileAndContent(file);

      if (!validation.isValid) {
        setError(validation.errors?.[0] || "Invalid file");
        setIsValidating(false);
        return;
      }

      // File is valid, pass it to parent
      console.log("File validated successfully:", validation.data);
      onFilesUploaded?.([file]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Validation failed");
    } finally {
      setIsValidating(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-1 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors min-h-[200px] flex items-center justify-center bg-[#1C1717] border-border-default
        ${isDragActive ? "border-blue-400 bg-blue-50/5" : ""}
        ${isHovered ? "bg-[#241E1E] border-border-highlight" : ""}
        ${error ? "border-red-500" : ""}
        ${isValidating ? "border-yellow-400 bg-yellow-50/5" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <div>
          <AnimatedImages isHovered={isHovered} />
        </div>
        <div className="">
          {isValidating ? (
            <p className="text-blue-400 text-xs font-medium">
              Validating file...
            </p>
          ) : isDragActive ? (
            <p className="text-blue-400 text-xs font-medium">
              Drop the file here...
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-text-inactive text-xs tracking-tight font-medium">
                Drag & drop your CSV file here
              </p>
              <p className="text-text-muted text-[10px] tracking-tight font-medium">
                Must have exactly 2 columns
              </p>
            </div>
          )}
        </div>
        {error && (
          <div className="text-red-400 text-xs font-medium mt-2 max-w-xs text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropzoneArea;
