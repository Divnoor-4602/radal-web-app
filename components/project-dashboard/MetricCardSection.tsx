"use client";

import React from "react";
import MetricCard from "./MetricCard";
import { Database, Brain, TrendingUp } from "lucide-react";

// Types for direct query results instead of Preloaded types
type ModelStatsData =
  | { totalCount: number; latestModelStatus: "none" }
  | {
      totalCount: number;
      latestModelStatus:
        | "training"
        | "ready"
        | "pending"
        | "converting"
        | "failed";
    };

type DatasetStatsData = {
  totalCount: number;
  latestDatasetTitle: string;
};

type RecentModelData = {
  modelName: string;
  status: "training" | "ready" | "pending" | "converting" | "failed";
  title: string;
} | null;

interface MetricCardSectionProps {
  modelStats: ModelStatsData | undefined;
  datasetStats: DatasetStatsData | undefined;
  recentModel: RecentModelData | undefined;
}

const MetricCardSection = ({
  modelStats,
  datasetStats,
  recentModel,
}: MetricCardSectionProps) => {
  // Data is already available as direct query results
  const modelStatsData = modelStats;
  const datasetStatsData = datasetStats;
  const recentModelData = recentModel;

  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Total Models */}
      <MetricCard
        icon={<Brain className="size-6" strokeWidth={1.5} />}
        title="Total Models"
        contentValue={modelStatsData?.totalCount ?? 0}
        contentDescription="Models created"
        pillText={
          modelStatsData?.latestModelStatus === "none"
            ? "No models"
            : modelStatsData?.latestModelStatus === "training"
              ? "Training"
              : modelStatsData?.latestModelStatus === "ready"
                ? "Ready"
                : modelStatsData?.latestModelStatus === "pending"
                  ? "Pending"
                  : modelStatsData?.latestModelStatus === "converting"
                    ? "Converting"
                    : modelStatsData?.latestModelStatus === "failed"
                      ? "Failed"
                      : "Unknown"
        }
        pillType={
          modelStatsData?.latestModelStatus === "ready"
            ? "success"
            : modelStatsData?.latestModelStatus === "failed"
              ? "error"
              : "info"
        }
      />

      {/* Total Datasets */}
      <MetricCard
        icon={<Database className="size-6" strokeWidth={1.5} />}
        title="Total Datasets"
        contentValue={datasetStatsData?.totalCount ?? 0}
        contentDescription="Datasets uploaded"
        pillText={
          datasetStatsData?.totalCount === 0
            ? "No datasets"
            : (datasetStatsData?.latestDatasetTitle ?? "Latest dataset")
        }
        pillType={datasetStatsData?.totalCount === 0 ? "info" : "success"}
      />

      {/* Latest Model */}
      <MetricCard
        icon={<TrendingUp className="size-6" strokeWidth={1.5} />}
        title="Latest Model"
        contentValue={recentModelData?.title ?? "No model"}
        contentDescription="Most recent creation"
        pillText={
          recentModelData?.status === "training"
            ? "Training"
            : recentModelData?.status === "ready"
              ? "Ready"
              : recentModelData?.status === "pending"
                ? "Pending"
                : recentModelData?.status === "converting"
                  ? "Converting"
                  : recentModelData?.status === "failed"
                    ? "Failed"
                    : "None"
        }
        pillType={
          recentModelData?.status === "ready"
            ? "success"
            : recentModelData?.status === "failed"
              ? "error"
              : "info"
        }
      />
    </div>
  );
};

export default MetricCardSection;
