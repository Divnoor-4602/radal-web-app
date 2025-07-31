"use client";

import React from "react";
import MetricCard from "./MetricCard";
import { File, Brain, Sparkles } from "lucide-react";
import MetricCardSectionLoading from "./MetricCardSectionLoading";
import {
  formatStatusText,
  getStatusPillType,
  formatDatasetPillText,
  getDatasetPillType,
  shouldShowAnimation,
  getTrainingCardTitle,
} from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

// Types for the actual query results
type ModelStatsData = {
  totalCount: number;
  latestModelStatus:
    | "pending"
    | "training"
    | "converting"
    | "ready"
    | "failed"
    | "none";
};

type DatasetStatsData = {
  totalCount: number;
  latestDatasetTitle: string;
};

type RecentModelData = {
  modelId: Id<"models">;
  modelName: string;
  status: "pending" | "training" | "converting" | "ready" | "failed";
  title: string;
  modelDownloadUrl?: string;
} | null;

interface MetricCardSectionProps {
  modelStats: ModelStatsData | undefined;
  datasetStats: DatasetStatsData | undefined;
  recentModel: RecentModelData | undefined;
  isLoading?: boolean;
}

const MetricCardSection = ({
  modelStats,
  datasetStats,
  recentModel,
  isLoading = false,
}: MetricCardSectionProps) => {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  // Check if data is available
  if (isLoading || !modelStats || !datasetStats) {
    return <MetricCardSectionLoading />;
  }

  const modelStatsData = modelStats;
  const datasetStatsData = datasetStats;
  const recentModelData = recentModel;

  // Click handler for training analytics card
  const handleTrainingCardClick = () => {
    if (recentModelData?.modelId) {
      router.push(`/projects/${projectId}/models/${recentModelData.modelId}`);
    }
  };

  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
      {/* Model Analytics Card */}
      <MetricCard
        icon={<Brain />}
        title="Total Models"
        contentValue={modelStatsData.totalCount.toString()}
        contentDescription="models"
        pillText={formatStatusText(modelStatsData.latestModelStatus)}
        pillType={getStatusPillType(modelStatsData.latestModelStatus)}
      />

      {/* Dataset Analytics Card */}
      <MetricCard
        icon={<File />}
        title="Total Datasets"
        contentValue={datasetStatsData.totalCount.toString()}
        contentDescription="datasets"
        pillText={formatDatasetPillText(
          datasetStatsData.latestDatasetTitle || "none",
        )}
        pillType={getDatasetPillType(
          datasetStatsData.latestDatasetTitle || "none",
        )}
      />

      {/* Training Analytics Card */}
      <MetricCard
        icon={
          <Sparkles
            className={
              shouldShowAnimation(recentModelData?.status || null)
                ? "animate-pulse"
                : ""
            }
          />
        }
        title={getTrainingCardTitle(recentModelData?.status || null)}
        contentValue={recentModelData?.modelName || "None"}
        contentValueClassName={`text-text-primary text-[30px] font-bold tracking-tighter mt-3 mb-[3px] ${
          shouldShowAnimation(recentModelData?.status || null)
            ? "animate-pulse"
            : ""
        }`}
        contentDescription={""}
        pillText={
          recentModelData?.status
            ? formatStatusText(recentModelData.status)
            : "None"
        }
        pillType={
          recentModelData?.status
            ? getStatusPillType(recentModelData.status)
            : "error"
        }
        className="lg:col-span-2 2xl:col-span-1"
        onClick={recentModelData?.modelId ? handleTrainingCardClick : undefined}
        showDownload={!!recentModelData}
        downloadUrl={recentModelData?.modelDownloadUrl}
        downloadTitle={recentModelData?.title}
        downloadStatus={recentModelData?.status}
      />
    </div>
  );
};

export default MetricCardSection;
