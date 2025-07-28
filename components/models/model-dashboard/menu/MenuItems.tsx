"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Download } from "lucide-react";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomPills from "@/components/shared/CustomPills";
import TrainingStatus from "./TrainingStatus";

const MenuItems = () => {
  const { modelId } = useParams();
  const { isAuthenticated } = useConvexAuth();

  // Fetch model data using the modelId from URL params only when authenticated
  const modelData = useQuery(
    api.models.getModelById,
    isAuthenticated ? { modelId: modelId as Id<"models"> } : "skip",
  );

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 15) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  // Helper function to handle download
  const handleDownload = () => {
    if (modelData?.modelDownloadUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = modelData.modelDownloadUrl;
      link.download = modelData.title || "model";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isDownloadAvailable =
    modelData?.modelDownloadUrl && modelData?.status === "ready";

  return (
    <>
      <Menubar className="bg-[#1C1717] border-border-default rounded-lg">
        {/* Configuration Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-text-primary text-sm hover:bg-bg-400 focus:bg-bg-400 data-[state=open]:bg-bg-400 tracking-tight rounded-lg !pl-3">
            Configuration
          </MenubarTrigger>
          <MenubarContent className="bg-bg-100 border-border-default">
            {modelData?.trainingConfig ? (
              <div className="p-2 space-y-3">
                <div className="text-xs text-text-muted mb-2">
                  Training Configuration
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Epochs</span>
                  <CustomPills
                    variant="neutral"
                    size="sm"
                    className="tracking-tighter py-[1px] px-2 text-xs"
                  >
                    {modelData.trainingConfig.epochs}
                  </CustomPills>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Batch Size</span>
                  <CustomPills
                    variant="neutral"
                    size="sm"
                    className="tracking-tighter py-[1px] px-2 text-xs"
                  >
                    {modelData.trainingConfig.batch_size}
                  </CustomPills>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Train Quant</span>
                  <CustomPills
                    variant="neutral"
                    size="sm"
                    className="tracking-tighter py-[1px] px-2 text-xs"
                  >
                    {modelData.trainingConfig.train_quant}
                  </CustomPills>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">
                    Download Quant
                  </span>
                  <CustomPills
                    variant="neutral"
                    size="sm"
                    className="tracking-tighter py-[1px] px-2 text-xs"
                  >
                    {modelData.trainingConfig.download_quant}
                  </CustomPills>
                </div>
              </div>
            ) : (
              <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717] text-text-muted">
                No configuration available
              </MenubarItem>
            )}
          </MenubarContent>
        </MenubarMenu>

        {/* Datasets Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-text-primary text-sm hover:bg-bg-400 focus:bg-bg-400 data-[state=open]:bg-bg-400 tracking-tight rounded-lg">
            Datasets
          </MenubarTrigger>
          <MenubarContent className="bg-bg-100 border-border-default">
            {modelData?.datasetIds && modelData.datasetIds.length > 0 ? (
              <div className="p-2 space-y-2 max-w-[300px]">
                <div className="text-xs text-text-muted mb-2">
                  Linked Datasets ({modelData.datasetIds.length})
                </div>
                {modelData.datasetIds.map((datasetId) => (
                  <DatasetItem
                    key={datasetId}
                    datasetId={datasetId}
                    truncateText={truncateText}
                  />
                ))}
              </div>
            ) : (
              <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717] text-text-muted">
                No datasets linked
              </MenubarItem>
            )}
          </MenubarContent>
        </MenubarMenu>

        {/* Download Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-text-primary text-sm hover:bg-bg-400 focus:bg-bg-400 data-[state=open]:bg-bg-400 tracking-tight rounded-lg !pr-4">
            Download
          </MenubarTrigger>
          <MenubarContent className="bg-bg-100 border-border-default">
            {isDownloadAvailable ? (
              <MenubarItem
                className="hover:bg-[#1C1717] focus:bg-[#1C1717] cursor-pointer"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Model
              </MenubarItem>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem
                    className="text-text-muted cursor-not-allowed opacity-50"
                    disabled
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Model
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-bg-400"
                  arrowClassName="bg-bg-400 fill-bg-400"
                >
                  {modelData?.status === "ready"
                    ? "Download URL not available"
                    : `Model is ${modelData?.status || "not ready"} - download not available`}
                </TooltipContent>
              </Tooltip>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <TrainingStatus
        status={modelData?.status}
        isLoading={modelData === undefined}
      />
    </>
  );
};

// Separate component for individual dataset items to handle useQuery properly
const DatasetItem = ({
  datasetId,
  truncateText,
}: {
  datasetId: Id<"datasets">;
  truncateText: (text: string, maxLength?: number) => string;
}) => {
  const { isAuthenticated } = useConvexAuth();

  const dataset = useQuery(
    api.datasets.getDatasetById,
    isAuthenticated ? { datasetId } : "skip",
  );

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-text-primary flex-1">
        {dataset ? truncateText(dataset.title) : "Loading..."}
      </span>
      {dataset && (
        <CustomPills
          variant="neutral"
          size="sm"
          className="tracking-tighter py-[1px] px-2 text-xs"
        >
          {dataset.rowCount || 0} rows
        </CustomPills>
      )}
    </div>
  );
};

export default MenuItems;
