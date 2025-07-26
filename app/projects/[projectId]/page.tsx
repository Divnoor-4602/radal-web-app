import DatasetUploadMetricCard from "@/components/project-dashboard/DatasetUploadMetricCard";
import ProjectTopbar from "@/components/project-dashboard/ProjectTopbar";
import React from "react";
import MetricCardSection from "@/components/project-dashboard/MetricCardSection";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getAuthToken } from "@/lib/actions/auth.actions";

type PageProps = {
  params: { projectId: string };
};

const ProjectPage = async ({ params }: PageProps) => {
  const { projectId } = await params;
  const token = await getAuthToken();

  // Preload all data on the server
  const modelStats = await preloadQuery(
    api.models.getModelStatsForProject,
    {
      projectId: projectId as Id<"projects">,
    },
    { token },
  );

  const datasetStats = await preloadQuery(
    api.datasets.getDatasetStatsForProject,
    {
      projectId: projectId as Id<"projects">,
    },
    { token },
  );

  const recentModel = await preloadQuery(
    api.models.getRecentModelForProject,
    {
      projectId: projectId as Id<"projects">,
    },
    { token },
  );

  const datasets = await preloadQuery(
    api.datasets.getProjectDatasets,
    {
      projectId: projectId as Id<"projects">,
    },
    { token },
  );

  return (
    <div className="flex flex-col h-full">
      {/* Project Topbar */}
      <ProjectTopbar projectId={projectId} />
      {/* Metric cards */}
      <MetricCardSection
        modelStats={modelStats}
        datasetStats={datasetStats}
        recentModel={recentModel}
      />
      {/* Dataset Uploaded Stat Card */}
      <DatasetUploadMetricCard datasets={datasets} />
    </div>
  );
};

export default ProjectPage;
