"use client";

import { Brain, File, Sparkles } from "lucide-react";
import React from "react";
import MetricCard from "./MetricCard";
import MetricCardSectionLoading from "@/components/shared/loading/MetricCardSectionLoading";
import {
  getStatusPillType,
  getDatasetPillType,
  getTrainingCardTitle,
  shouldShowAnimation,
  formatStatusText,
  formatDatasetPillText,
} from "@/lib/utils";

type ModelStats = {
  totalCount: number;
  latestModelStatus:
    | "none"
    | "training"
    | "ready"
    | "pending"
    | "converting"
    | "failed";
};

type DatasetStats = {
  totalCount: number;
  latestDatasetTitle: string | null;
};

type RecentModel = {
  modelName: string;
  status: "training" | "ready" | "pending" | "converting" | "failed";
} | null;

interface MetricCardSectionProps {
  modelStats: ModelStats;
  datasetStats: DatasetStats;
  recentModel: RecentModel;
  isLoading?: boolean;
}

const MetricCardSection = ({
  modelStats,
  datasetStats,
  recentModel,
  isLoading = false,
}: MetricCardSectionProps) => {
  if (isLoading) {
    return <MetricCardSectionLoading />;
  }

  return (
    <div className="mt-12 grid grid-cols-1 2xl:grid-cols-3 gap-4">
      <MetricCard
        icon={<Brain />}
        title="Total Models"
        contentValue={modelStats.totalCount.toString()}
        contentDescription="models"
        pillText={formatStatusText(modelStats.latestModelStatus)}
        pillType={getStatusPillType(modelStats.latestModelStatus)}
      />
      <MetricCard
        icon={<File />}
        title="Total Datasets"
        contentValue={datasetStats.totalCount.toString()}
        contentDescription="datasets"
        pillText={formatDatasetPillText(datasetStats.latestDatasetTitle || "")}
        pillType={getDatasetPillType(datasetStats.latestDatasetTitle || "")}
      />
      <MetricCard
        icon={
          <Sparkles
            className={
              shouldShowAnimation(recentModel?.status || null)
                ? "animate-pulse"
                : ""
            }
          />
        }
        title={getTrainingCardTitle(recentModel?.status || null)}
        contentValue={recentModel?.modelName || "None"}
        contentValueClassName={`text-text-primary text-[30px] font-bold tracking-tighter mt-3 mb-[3px] ${shouldShowAnimation(recentModel?.status || null) ? "animate-pulse" : ""}`}
        contentDescription={recentModel?.status || ""}
        pillText={
          recentModel?.status ? formatStatusText(recentModel.status) : "None"
        }
        pillType={
          recentModel?.status ? getStatusPillType(recentModel.status) : "error"
        }
      />
    </div>
  );
};

export default MetricCardSection;
