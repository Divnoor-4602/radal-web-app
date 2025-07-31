"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Menubar } from "@/components/ui/menubar";
import ConfigurationMenu from "./ConfigurationMenu";
import DatasetsMenu from "./DatasetsMenu";
import DownloadMenu from "./DownloadMenu";
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

  return (
    <>
      <Menubar className="bg-[#1C1717] border-border-default rounded-lg">
        <ConfigurationMenu trainingConfig={modelData?.trainingConfig} />
        <DatasetsMenu
          datasetIds={modelData?.datasetIds}
          truncateText={truncateText}
        />
        <DownloadMenu
          modelDownloadUrl={modelData?.modelDownloadUrl}
          modelTitle={modelData?.title || "model"}
          status={modelData?.status}
        />
      </Menubar>
      <TrainingStatus
        status={modelData?.status}
        isLoading={modelData === undefined}
      />
    </>
  );
};

export default MenuItems;
