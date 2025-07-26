"use client";

import DatasetUploadMetricCard from "@/components/project-dashboard/DatasetUploadMetricCard";
import ProjectTopbar from "@/components/project-dashboard/ProjectTopbar";
import React from "react";
import MetricCardSection from "@/components/project-dashboard/MetricCardSection";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  // Fetch all data at page level to control loading state
  const modelStats = useQuery(api.models.getModelStatsForProject, {
    projectId: projectId as Id<"projects">,
  });
  const datasetStats = useQuery(api.datasets.getDatasetStatsForProject, {
    projectId: projectId as Id<"projects">,
  });
  const recentModel = useQuery(api.models.getRecentModelForProject, {
    projectId: projectId as Id<"projects">,
  });
  const datasets = useQuery(api.datasets.getProjectDatasets, {
    projectId: projectId as Id<"projects">,
  });

  // Check if any data is still loading
  const isLoading =
    modelStats === undefined ||
    datasetStats === undefined ||
    recentModel === undefined ||
    datasets === undefined;

  return (
    <div className="flex flex-col h-full">
      {/* Project Topbar */}
      <ProjectTopbar projectId={projectId} isLoading={isLoading} />
      {/* Metric cards */}
      <MetricCardSection
        modelStats={modelStats!}
        datasetStats={datasetStats!}
        recentModel={recentModel!}
        isLoading={isLoading}
      />
      {/* Dataset Uploaded Stat Card */}
      <DatasetUploadMetricCard datasets={datasets} isLoading={isLoading} />
    </div>
  );
};

export default ProjectPage;
