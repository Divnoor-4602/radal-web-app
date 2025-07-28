"use client";

import React from "react";
import { MoreHorizontal, Download, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

type DatasetActionsProps = {
  datasetId: string;
};

export const DatasetActions: React.FC<DatasetActionsProps> = ({
  datasetId,
}) => {
  const { isAuthenticated } = useConvexAuth();

  const dataset = useQuery(
    api.datasets.getDatasetById,
    isAuthenticated ? { datasetId: datasetId as Id<"datasets"> } : "skip",
  );
  const deleteDataset = useMutation(api.datasets.deleteDataset);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(datasetId);
      toast.success("Dataset ID copied to clipboard");
    } catch {
      toast.error("Failed to copy dataset ID");
    }
  };

  const handleDownload = () => {
    if (dataset?.azureUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = dataset.azureUrl;
      link.download = dataset.originalFilename || "dataset.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Dataset download started");
    } else {
      toast.error("Download URL not available");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDataset({ datasetId: datasetId as Id<"datasets"> });
      toast.success("Dataset deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete dataset",
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-8 w-8 p-0 bg-[#1C1717] hover:bg-[#2A2424] focus:ring-0 focus:ring-offset-0 focus:outline-none",
            "data-[state=open]:ring-0 data-[state=open]:ring-offset-0",
          )}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#666666]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-bg-100 border-border-default"
      >
        <DropdownMenuItem
          onClick={handleCopyId}
          className="text-text-primary hover:bg-[#1C1717] focus:bg-[#1C1717] cursor-pointer"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy dataset ID
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border-default" />
        <DropdownMenuItem
          onClick={handleDownload}
          className="text-text-primary hover:bg-[#1C1717] focus:bg-[#1C1717] cursor-pointer"
          disabled={!dataset?.azureUrl}
        >
          <Download className="mr-2 h-4 w-4" />
          Download dataset
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete dataset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
