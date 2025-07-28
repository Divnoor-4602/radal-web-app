"use client";

import { Brain, File, Sparkles } from "lucide-react";
import React from "react";
import MetricCard from "./MetricCard";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  getStatusPillType,
  getDatasetPillType,
  getTrainingCardTitle,
  shouldShowAnimation,
  formatStatusText,
  formatDatasetPillText,
} from "@/lib/utils";

interface MetricCardSectionProps {
  modelStats: Preloaded<typeof api.models.getModelStatsForProject>;
  datasetStats: Preloaded<typeof api.datasets.getDatasetStatsForProject>;
  recentModel: Preloaded<typeof api.models.getRecentModelForProject>;
}

const MetricCardSection = ({
  modelStats,
  datasetStats,
  recentModel,
}: MetricCardSectionProps) => {
  // Use preloaded queries - data is instantly available
  const modelStatsData = usePreloadedQuery(modelStats);
  const datasetStatsData = usePreloadedQuery(datasetStats);
  const recentModelData = usePreloadedQuery(recentModel);

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
        className="col-span-1 lg:col-span-2 2xl:col-span-1"
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
        contentValueClassName={`text-text-primary text-[24px] font-bold tracking-tighter mt-3 mb-[12px] ${
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
      />
    </div>
  );
};

export default MetricCardSection;
