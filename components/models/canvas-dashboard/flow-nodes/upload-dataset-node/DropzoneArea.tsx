"use client";

import React, { FC, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { validateCSVFileAndContent } from "@/lib/validations/csv.schema";
import { File } from "lucide-react";
import { motion } from "motion/react";
import { formatFileSize } from "@/lib/utils";
import AnimatedStateList from "./AnimatedStateList";
import AnimatedImages from "./AnimatedImages";

type TDropzoneAreaProps = {
  onFileUploaded?: (file: File | null) => void;
};

export type TDropzoneUploadStatus = {
  state:
    | "idle"
    | "filename"
    | "uploading"
    | "validating"
    | "cleaning"
    | "normalising"
    | "transforming"
    | "saving"
    | "uploaded"
    | "error";
  error?: string;
  uploadedFile?: File;
};

// Upload flow configuration
const uploadSteps = [
  { state: "uploading", duration: 2000 },
  { state: "validating", duration: 2000 },
  { state: "cleaning", duration: 2000 },
  { state: "normalising", duration: 2000 },
  { state: "transforming", duration: 2000 },
  { state: "saving", duration: 2000 },
] as const;

export const DropzoneArea: FC<TDropzoneAreaProps> = ({ onFileUploaded }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [showSuccessText, setShowSuccessText] = useState<boolean>(false);

  const [uploadStatus, setUploadStatus] = useState<TDropzoneUploadStatus>({
    state: "idle",
  });

  // Derived states from uploadStatus.state
  const translateFileImages = uploadSteps.some(
    (step) => step.state === uploadStatus.state,
  );
  const shouldExitStateList = uploadStatus.state === "uploaded";
  const translateImagesBack = uploadStatus.state === "uploaded";

  // Notify parent only when file changes (not during upload steps)

  // TODO: Replace this with actual upload logic
  const simulateUploadFlow = async () => {
    // Show filename for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Wait before showing checkbox list
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Process each upload step
    for (const step of uploadSteps) {
      setUploadStatus((prev) => ({ ...prev, state: step.state }));
      await new Promise((resolve) => setTimeout(resolve, step.duration));
    }

    // Wait for exit animation
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Mark as uploaded
    setUploadStatus((prev) => ({ ...prev, state: "uploaded" }));

    // Wait for images to settle, then show success text
    await new Promise((resolve) => setTimeout(resolve, 400));
    setShowSuccessText(true);
  };

  /***
   * onDrop is the function that is called when a file is dropped on the dropzone
   * It is used to validate the file and pass it to the parent component i.e. UploadDatasetNode
   */
  const onDrop = async (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[],
  ) => {
    // Reset states for new upload
    setIsValidating(true);
    setUploadStatus({
      state: "idle",
      error: undefined,
    });
    setShowSuccessText(false);
    onFileUploaded?.(null); // Clear previous file from parent

    // Handle rejected files from dropzone
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      setUploadStatus({
        state: "error",
        error: rejection.errors[0]?.message || "File rejected",
      });
      setIsValidating(false);
      onFileUploaded?.(null); // Clear file from parent
      return;
    }

    // Validate accepted files
    if (acceptedFiles.length === 0) {
      setUploadStatus({
        state: "error",
        error: "No files selected",
      });
      setIsValidating(false);
      onFileUploaded?.(null); // Clear file from parent
      return;
    }

    try {
      const file = acceptedFiles[0]; // Single file only

      // Use new CSV validation
      const validation = await validateCSVFileAndContent(file);

      if (!validation.isValid) {
        setUploadStatus({
          state: "error",
          error: validation.errors?.[0] || "Invalid file",
        });
        setIsValidating(false);
        onFileUploaded?.(null); // Clear file from parent
        return;
      }

      // File is valid, start upload process
      console.log("File validated successfully:", validation.data);

      // Start with filename state
      setUploadStatus({
        state: "filename",
        uploadedFile: file,
      });

      // Notify parent that file is selected
      onFileUploaded?.(file);

      simulateUploadFlow();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Validation failed";
      setUploadStatus({
        state: "error",
        error: errorMessage,
      });
      onFileUploaded?.(null); // Clear file from parent
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

  // Check if should show active state (hover or drag) - disable when uploaded
  const isActive =
    (isHovered || isDragActive) && uploadStatus.state !== "uploaded";

  return (
    <div
      {...getRootProps()}
      className={`
        border-1 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 h-[200px] flex items-center justify-center bg-[#1C1717] border-border-default overflow-hidden
        ${isActive ? "bg-[#241E1E] border-border-highlight" : ""}
        ${uploadStatus.error ? "border-red-500" : ""}
        ${isValidating ? "border-yellow-400 bg-yellow-50/5" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-1">
        <div>
          <AnimatedImages
            isHovered={isHovered}
            isDragActive={isDragActive}
            translateFileImages={translateFileImages}
            translateBackIntoView={translateImagesBack}
            disableHoverEffects={uploadStatus.state === "uploaded"}
          />
        </div>
        <div className="">
          {isValidating ? (
            <p className="text-blue-400 text-xs font-medium">
              Validating file...
            </p>
          ) : uploadStatus.state === "filename" ? (
            <div className="flex flex-col gap-1">
              <div className="text-text-inactive text-xs tracking-tight font-medium transition-colors duration-200 animate-pulse flex items-center gap-1">
                <File className="size-3" />
                {uploadStatus.uploadedFile?.name}
              </div>
              <p className="text-text-muted text-[10px] tracking-tight font-medium transition-colors duration-200">
                Preparing
              </p>
            </div>
          ) : uploadSteps.some((step) => step.state === uploadStatus.state) ? (
            <AnimatedStateList
              currentState={
                uploadStatus.state as
                  | "uploading"
                  | "validating"
                  | "cleaning"
                  | "normalising"
                  | "transforming"
                  | "saving"
              }
              shouldExit={shouldExitStateList}
            />
          ) : uploadStatus.state === "uploaded" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showSuccessText ? 1 : 0, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-2"
            >
              <div className="flex flex-col gap-1">
                <p className="text-success-border text-xs tracking-tight font-medium transition-colors duration-200">
                  File uploaded successfully
                </p>
                <div className="text-text-muted text-[10px] tracking-tight font-medium transition-colors duration-200 flex items-center gap-1">
                  <File className="size-2" />
                  {uploadStatus.uploadedFile?.name} -{" "}
                  {uploadStatus.uploadedFile &&
                    formatFileSize(uploadStatus.uploadedFile.size)}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-1">
              <p
                className={`text-xs tracking-tight font-medium transition-colors duration-200 ${
                  isActive ? "text-text-highlight" : "text-text-inactive"
                }`}
              >
                Drag & drop your CSV file here
              </p>
              <p className="text-text-muted text-[10px] tracking-tight font-medium transition-colors duration-200">
                Must have exactly 2 columns
              </p>
            </div>
          )}
        </div>
        {uploadStatus.error && (
          <div className="text-red-400 text-xs font-medium mt-2 max-w-xs text-center">
            {uploadStatus.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropzoneArea;
