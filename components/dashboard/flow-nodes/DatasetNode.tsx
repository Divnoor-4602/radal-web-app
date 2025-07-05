"use client";

import { useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  File,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import useFlowStore, { DatasetNodeData } from "@/lib/stores/flowStore";
import { CSVFileSchema } from "@/lib/validations/project.schema";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface DatasetNodeProps extends NodeProps {
  data: DatasetNodeData;
}

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  progress: number; // 0-100
  currentStep: string;
  stats?: {
    rows: number;
    columns: number;
    headers: string[];
  };
  preprocessing?: {
    originalColumns: number;
    finalColumns: number;
    removedColumns: number;
    removedIndexColumns: boolean;
    totalRows: number;
  };
}

// Progress Bar Component
const ProgressBar = ({
  progress,
  currentStep,
}: {
  progress: number;
  currentStep: string;
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-600">{currentStep}</span>
        <span className="text-xs font-medium text-gray-600">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="rainbow-gradient h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default function DatasetNode({ id, data }: DatasetNodeProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const params = useParams();
  const projectId = params.projectId as string;

  // Get current user from Convex
  const currentUser = useQuery(api.users.current);

  const [title, setTitle] = useState(data.title || "Dataset");
  const [description, setDescription] = useState(data.description || "");
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    uploading: false,
    uploaded: false,
    error: null,
    progress: 0,
    currentStep: "Ready to upload",
  });

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      updateNodeData(id, { title: newTitle });
    },
    [id, updateNodeData],
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDescription = e.target.value;
      setDescription(newDescription);
      updateNodeData(id, { description: newDescription });
    },
    [id, updateNodeData],
  );

  const validateFile = useCallback((file: File): string | null => {
    try {
      CSVFileSchema.parse(file);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "Invalid file";
    }
  }, []);

  const updateProgress = (progress: number, step: string) => {
    setUploadState((prev) => ({
      ...prev,
      progress,
      currentStep: step,
    }));
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      // Check if user is loaded
      if (!currentUser) {
        toast.error("Authentication required", {
          description: "Please wait for authentication to load",
        });
        return;
      }

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadState((prev) => ({ ...prev, error: validationError }));
        toast.error("File validation failed", {
          description: validationError,
        });
        return;
      }

      setUploadState((prev) => ({
        ...prev,
        file,
        uploading: true,
        error: null,
        progress: 0,
        currentStep: "Validating file...",
      }));

      try {
        // Simulate progress updates
        updateProgress(10, "Preparing upload...");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);
        formData.append("userId", currentUser._id);
        formData.append("title", title || "Dataset");
        formData.append("description", description || "");

        updateProgress(25, "Uploading file...");

        const response = await fetch("/api/upload-dataset", {
          method: "POST",
          body: formData,
        });

        updateProgress(50, "Parsing CSV structure...");

        // Add small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 500));

        updateProgress(70, "Removing index columns...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        updateProgress(85, "Cleaning text data...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Upload failed");
        }

        updateProgress(100, "Upload completed!");

        // Update upload state with success
        setUploadState((prev) => ({
          ...prev,
          uploading: false,
          uploaded: true,
          progress: 100,
          currentStep: "Processing complete",
          stats: result.stats,
          preprocessing: result.preprocessing,
        }));

        // Update node data with upload results
        updateNodeData(id, {
          files: [file.name],
          datasetId: result.datasetId,
          storageId: result.storageId,
          stats: result.stats,
          preprocessing: result.preprocessing,
        });

        // Show success toast with preprocessing info
        let toastDescription = `${result.stats.rows} rows, ${result.stats.columns} columns`;
        if (result.preprocessing?.removedColumns > 0) {
          toastDescription += ` • Removed ${result.preprocessing.removedColumns} index column(s)`;
        }

        toast.success("Dataset uploaded and cleaned successfully!", {
          description: toastDescription,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setUploadState((prev) => ({
          ...prev,
          uploading: false,
          error: errorMessage,
          progress: 0,
          currentStep: "Upload failed",
        }));
        toast.error("Upload failed", {
          description: errorMessage,
        });
      }
    },
    [
      id,
      projectId,
      title,
      description,
      updateNodeData,
      validateFile,
      currentUser,
    ],
  );

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);

      if (droppedFiles.length > 0) {
        handleFileUpload(droppedFiles[0]);
      }
    },
    [handleFileUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        handleFileUpload(selectedFiles[0]);
      }
    },
    [handleFileUpload],
  );

  const handleRemoveFile = useCallback(() => {
    setUploadState({
      file: null,
      uploading: false,
      uploaded: false,
      error: null,
      progress: 0,
      currentStep: "Ready to upload",
    });
    updateNodeData(id, {
      files: [],
      datasetId: undefined,
      storageId: undefined,
      stats: undefined,
      preprocessing: undefined,
    });
  }, [id, updateNodeData]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Show loading state if user is not loaded yet
  if (currentUser === undefined) {
    return (
      <div className="relative w-96 p-1">
        {/* Moving gradient border */}
        <div className="absolute inset-0 rainbow-gradient-animated rounded-lg" />

        {/* Card */}
        <Card className="relative bg-white shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-lg flex items-center gap-3">
              <File className="h-5 w-5 text-gray-700" />
              Dataset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-96 p-1">
      {/* Moving gradient border */}
      <div className="absolute inset-0 rainbow-gradient-animated rounded-lg" />

      {/* Card */}
      <Card className="relative bg-white shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg flex items-center gap-3">
            <File className="h-5 w-5 text-gray-700" />
            Dataset
            {data.isTrained && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium ml-auto">
                <CheckCircle className="w-3 h-3" />
                Trained
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-6">
          {data.isTrained ? (
            // Trained state - read-only view
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Dataset Used in Training
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  This dataset was successfully used to train a model. The
                  configuration below shows the setup from the training session.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Title
                  </Label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                    {data.title}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </Label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                    {data.description}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Editable state - normal upload flow
            <>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter dataset title"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Enter dataset description"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 block">
                  CSV File
                </Label>

                {!uploadState.file ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200 cursor-pointer group"
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                  >
                    <Upload className="h-12 w-12 mx-auto text-gray-400 group-hover:text-purple-500 transition-colors mb-4" />
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      Drag & drop your CSV file here, or click to select
                    </p>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto">
                      Auto-cleaning: Removes index columns, trims whitespace,
                      normalizes data
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                      disabled={!currentUser}
                      className="hover:bg-purple-50 hover:border-purple-300 px-6"
                    >
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5 p-6 border border-gray-200 rounded-lg bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {uploadState.uploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-purple-600 flex-shrink-0" />
                        ) : uploadState.uploaded ? (
                          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        ) : uploadState.error ? (
                          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                        ) : (
                          <File className="h-6 w-6 text-gray-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-700 block truncate">
                            {uploadState.file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(uploadState.file.size / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        disabled={uploadState.uploading}
                        className="hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {uploadState.uploading && (
                      <ProgressBar
                        progress={uploadState.progress}
                        currentStep={uploadState.currentStep}
                      />
                    )}

                    {uploadState.uploaded && uploadState.stats && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="grid grid-cols-2 gap-4 flex-1">
                            <div>
                              <span className="text-xs text-gray-500">
                                Rows
                              </span>
                              <p className="text-sm font-medium text-gray-700">
                                {uploadState.stats.rows.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">
                                Columns
                              </span>
                              <p className="text-sm font-medium text-gray-700">
                                {uploadState.stats.columns}
                              </p>
                            </div>
                          </div>
                        </div>

                        {uploadState.preprocessing && (
                          <div className="space-y-3">
                            {uploadState.preprocessing.removedColumns > 0 && (
                              <div className="flex items-start gap-3">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">
                                  Removed{" "}
                                  {uploadState.preprocessing.removedColumns}{" "}
                                  index column(s)
                                </span>
                              </div>
                            )}
                            <div className="flex items-start gap-3">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600">
                                Text cleaned: trimmed whitespace, normalized
                                empty values
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Headers:</span>{" "}
                            <span className="break-words">
                              {uploadState.stats.headers.join(", ")}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadState.error && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700 break-words">
                            {uploadState.error}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 rainbow-gradient border-2 border-white"
        />
      </Card>
    </div>
  );
}
