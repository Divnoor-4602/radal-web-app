"use client";

import React, { FC, useEffect, useState, memo, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { validateCSVFileAndContent } from "@/lib/validations/csv.schema";
import { File } from "lucide-react";
import { useAnimate } from "motion/react";
import AnimatedImages from "./AnimatedImages";
import AnimatedStateList from "./AnimatedStateList";
import { formatFileSize } from "@/lib/utils";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import useFlowStore from "@/lib/stores/flowStore";

type TDropzoneAreaProps = {
  nodeId: string;
  projectId: string;
  title: string;
  description?: string;
};

/***
 * Client-side
 * Idle -> empty state
 * client-side-validating -> Preparing before the flow starts
 * uploading -> client side validation and steps before sending to the server
 * Server-side
 * validating -> server side validation
 * cleaning -> preprocessing the data
 * normalising -> normalising the columns
 * transforming -> just an update
 * saving -> saving the data to the storage
 * uploaded -> the file is uploaded and the flow is complete and the response has been obtained
 */
export type TDropzoneUploadStatus = {
  state:
    | "idle"
    | "client-side-validating"
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
  projectId?: string;
  title?: string;
  description?: string;
};

export const DropzoneArea: FC<TDropzoneAreaProps> = memo(
  ({ nodeId, projectId, title, description }) => {
    const { updateNodeData } = useFlowStore();
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const [uploadStatus, setUploadStatus] = useState<TDropzoneUploadStatus>({
      state: "idle",
    });

    const handleUploadStatus = (
      status: Partial<TDropzoneUploadStatus>,
      error?: string,
    ) => {
      setUploadStatus((prev) => ({
        ...prev,
        ...status,
        error: error || status.error || prev.error || "",
        uploadedFile: status.uploadedFile || prev.uploadedFile, // Preserve uploadedFile
      }));
    };

    const resetUploadDropzoneArea = () => {
      // reset the state of the upload dropzone area
      // reset the dropzone area
      setUploadStatus({
        state: "idle",
        error: "",
        uploadedFile: undefined,
      });

      // reset the upload dataset node
    };

    // Get the scope and animate from the use animate hook
    const [scope, animate] = useAnimate();

    // Memoize animation functions to avoid dependency issues
    const animations = useCallback(
      () => ({
        // uploading -> this is shown till the client side validation and file prepartion goes on
        clientSideValidating: async () => {
          // disable hover effects for the animated images
        },

        // server side upload flow -> All the steps from validating to saving are handled here
        serverSideUploadFlow: async () => {
          // translate the animated images out of the view
          await animate(
            ".animated-images",
            {
              y: -150,
            },
            { duration: 0.4, ease: "easeOut" },
          );
          // bring the state list in view
          await animate(
            ".animated-content",
            {
              y: 0,
              opacity: 1,
            },
            { duration: 0.4, ease: "easeOut" },
          );
        },

        // uploaded -> this is shown after the server side upload flow is complete (success flow)
        uploaded: async () => {
          // Hide state list first
          await animate(
            ".animated-content",
            { opacity: 0, y: 200 },
            {
              duration: 0.3,
              ease: "easeOut",
            },
          );

          // Bring images back
          await animate(
            ".animated-images",
            { y: 0 },
            {
              duration: 0.3,
              ease: "easeOut",
            },
          );
        },

        // error -> this is shown after the server side upload flow is complete
        error: async () => {
          // Hide state list first
          await animate(
            ".animated-content",
            { opacity: 0, y: 200 },
            { duration: 0.3, ease: "easeOut" },
          );

          // Bring images back
          await animate(
            ".animated-images",
            { y: 0 },
            { duration: 0.3, ease: "easeOut" },
          );

          // Add shake animation for error feedback
          await animate(
            ".animated-images",
            {
              x: [0, -3, 4, -2, 3, -1, 2, 0],
              rotate: [0, -2, 2, -1, 1, 0],
            },
            { duration: 0.3, ease: "linear" },
          );
        },
      }),
      [animate],
    );

    const handleStreamingUpload = async (fileToUpload?: File) => {
      try {
        // get the file from parameter or upload status
        const file = fileToUpload || uploadStatus.uploadedFile;

        if (!file) {
          throw new Error("No file available for upload");
        }

        // Validate required props
        if (!projectId || !title) {
          throw new Error(
            `Missing required props: ${!projectId ? "projectId" : ""} ${!title ? "title" : ""}`,
          );
        }

        // prepare form data for the API call
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);
        // Use filename without extension as the title for the dataset, not the node title
        const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        formData.append("title", fileNameWithoutExtension);
        if (description) {
          formData.append("description", description);
        }

        // Make the API call to upload the dataset with streaming
        const response = await fetch("/api/upload-dataset", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          // Try to get error details from response
          let errorText = "Unknown error";
          try {
            const errorData = await response.json();
            errorText = errorData.error || errorData.message || errorText;
          } catch {
            // If JSON parsing fails, try text
            try {
              errorText = await response.text();
            } catch {
              // Could not parse error response
            }
          }

          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No readable stream available");
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim().startsWith("data: ")) {
              try {
                const jsonStr = line.trim().substring(6); // Remove 'data: ' prefix
                const update = JSON.parse(jsonStr);

                // Update UI state based on server response
                if (update.state === "error") {
                  handleUploadStatus({
                    state: "error",
                    error: update.error || "Upload failed",
                  });

                  // Update flow store status to error
                  updateNodeData(nodeId, {
                    status: "error",
                  });
                  return;
                } else if (update.state === "uploaded") {
                  handleUploadStatus({ state: "uploaded" });

                  // Update flow store with the uploaded dataset data
                  if (
                    update.data &&
                    update.data.azureUrl &&
                    update.data.storageId
                  ) {
                    updateNodeData(nodeId, {
                      status: "success",
                      azureUrl: update.data.azureUrl,
                      storageId: update.data.storageId,
                    });
                  }
                  return;
                } else {
                  // Update to intermediate state
                  handleUploadStatus({
                    state: update.state as TDropzoneUploadStatus["state"],
                  });
                }
              } catch (parseError) {
                console.error("Failed to parse state update:", parseError);
              }
            }
          }
        }
      } catch (error) {
        handleUploadStatus({
          state: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        });

        // Update flow store status to error
        updateNodeData(nodeId, {
          status: "error",
        });
      }
    };

    useEffect(() => {
      const triggerAnimation = async () => {
        const animationFunctions = animations();
        switch (uploadStatus.state) {
          case "uploading":
            await animationFunctions.serverSideUploadFlow();
            break;
          case "uploaded":
            // success flow state
            await animationFunctions.uploaded();
            break;
          case "error":
            // Show error state
            await animationFunctions.error();
            break;
        }
      };

      triggerAnimation();
    }, [uploadStatus.state, animations]);

    const onDrop = async (
      acceptedFiles: File[],
      rejectedFiles: FileRejection[],
    ) => {
      // reset the dropzone area before the drop upload starts
      resetUploadDropzoneArea();

      // Client side states
      // Set the state to client side validating when the file is dropped
      handleUploadStatus({ state: "client-side-validating" });

      // Handle rejected files from dropzone
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        handleUploadStatus({
          state: "error",
          error: rejection.errors[0]?.message || "File rejected",
        });
        return;
      }

      // Validate accepted files
      if (acceptedFiles.length === 0) {
        handleUploadStatus({
          state: "error",
          error: "No files selected",
        });

        return;
      }

      try {
        const file = acceptedFiles[0];

        // Use new CSV validation
        const validation = await validateCSVFileAndContent(file);

        if (!validation.isValid) {
          handleUploadStatus({
            state: "error",
            error: validation.errors?.[0] || "Invalid file",
          });
          return;
        }

        // File is valid, start upload process
        // Update flow store with the file immediately after validation
        const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        updateNodeData(nodeId, {
          file: file.name,
          title: fileNameWithoutExtension,
        });

        // Set the state to uploading and the uploaded file
        handleUploadStatus({
          state: "uploading",
          uploadedFile: file,
        });

        // File is now stored in flow store

        // Start streaming upload
        handleStreamingUpload(file);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Validation failed";
        handleUploadStatus({
          state: "error",
          error: errorMessage,
        });
      }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        "text/csv": [".csv"],
      },
      multiple: false,
      maxFiles: 1,
      disabled: uploadStatus.state === "uploaded", // Disable when uploaded
    });

    // Check if should show active state (hover or drag) - but not when uploaded
    const isActive =
      (isHovered || isDragActive) && uploadStatus.state !== "uploaded";

    // Disable hover when uploaded
    const handleMouseEnter = () => {
      if (uploadStatus.state !== "uploaded") {
        setIsHovered(true);
      }
    };

    const handleMouseLeave = () => {
      if (uploadStatus.state !== "uploaded") {
        setIsHovered(false);
      }
    };

    return (
      <div
        {...(uploadStatus.state === "uploaded" ? {} : getRootProps())}
        ref={scope}
        className={`
        relative border-1 border-dashed rounded-lg p-6 text-center transition-colors duration-200 h-[200px] flex items-center justify-center bg-[#1C1717] border-border-default overflow-hidden
        ${uploadStatus.state === "uploaded" ? "cursor-default" : "cursor-pointer"}
        ${isActive ? "bg-[#241E1E] border-border-highlight" : ""}
        ${uploadStatus.state === "error" && uploadStatus.error ? "border-error bg-bg-100" : ""}
        ${uploadStatus.state === "uploaded" ? "border-success-border bg-[#241E1E]" : ""}
        ${uploadStatus.state === "client-side-validating" ? "border-border-highlight bg-[#241E1E]" : ""}
      `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {uploadStatus.state !== "uploaded" && <input {...getInputProps()} />}

        {/* Animatable components -> always mounted */}
        {/* Animated images - centered in dropzone */}
        <div className="animated-images absolute mb-12 z-0">
          <AnimatedImages
            isHovered={isHovered}
            isDragActive={isDragActive}
            disableHoverEffects={uploadStatus.state !== "idle"}
          />
        </div>

        {/* Animated state list - positioned for animation */}
        <div
          className="animated-content absolute"
          style={{ transform: "translateY(200px)", opacity: 0 }}
        >
          {/* The step counter list is rendered after the client side validation is complete */}
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
          />
        </div>

        {/* Conditional rendered content -> not reliant on animation state */}

        {/* Base text on idle component */}
        {uploadStatus.state === "idle" && (
          <div className="flex flex-col gap-1 items-center mt-12">
            <p
              className={`text-xs tracking-tight font-medium transition-colors duration-200 ${
                isActive ? "text-text-highlight" : "text-text-inactive"
              }`}
            >
              Drag & drop your CSV file here
            </p>
            <p className="text-text-muted text-[10px] tracking-tight font-medium">
              Must have exactly 2 columns and 500-10,000 rows
            </p>
          </div>
        )}
        {/* Client side validating -> preparing text */}
        {uploadStatus.state === "client-side-validating" && (
          <div className="flex flex-col gap-1 items-center mt-12">
            <p
              className={`text-xs tracking-tight font-medium transition-colors animate-pulse duration-200 text-text-highlight`}
            >
              Preparing
            </p>
            <p className="text-text-muted text-[10px] tracking-tight font-medium">
              Working on your file for upload.
            </p>
          </div>
        )}

        {/* Animated presence for the success text to animate the entry and exit properly */}
        <AnimatePresence>
          {uploadStatus.state === "uploaded" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col gap-1 items-center mt-12"
            >
              {/* file details content */}
              <p className="text-success-border text-xs tracking-tight font-medium">
                File uploaded successfully
              </p>
              <div className="text-text-muted text-[10px] tracking-tight font-medium flex items-center gap-1">
                <File className="size-2" />
                {uploadStatus.uploadedFile?.name} -{" "}
                {uploadStatus.uploadedFile &&
                  formatFileSize(uploadStatus.uploadedFile.size)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated presence for the error text to animate the entry and exit properly */}
        <AnimatePresence>
          {uploadStatus.state === "error" && uploadStatus.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col gap-1 items-center mt-12 relative z-10"
            >
              <p className="text-error-border text-xs tracking-tight font-medium">
                {uploadStatus.error}
              </p>
              <p className="text-text-muted text-[10px] tracking-tight font-medium">
                Please try uploading again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

DropzoneArea.displayName = "DropzoneArea";

export default DropzoneArea;
