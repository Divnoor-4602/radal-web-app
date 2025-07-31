"use client";

import DatasetUploadMetricCard from "@/components/project-dashboard/DatasetUploadMetricCard";
import ProjectTopbar from "@/components/project-dashboard/ProjectTopbar";
import React, { useEffect } from "react";
import MetricCardSection from "@/components/project-dashboard/MetricCardSection";
import {
  useQuery,
  useConvexAuth,
  Authenticated,
  Unauthenticated,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  // First check if the project exists
  const project = useQuery(
    api.projects.getProjectById,
    isAuthenticated ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  // Use the "skip" pattern to wait for authentication and project existence
  const shouldSkipQueries = !isAuthenticated || project === null;

  const modelStats = useQuery(
    api.models.getModelStatsForProject,
    shouldSkipQueries ? "skip" : { projectId: projectId as Id<"projects"> },
  );

  const datasetStats = useQuery(
    api.datasets.getDatasetStatsForProject,
    shouldSkipQueries ? "skip" : { projectId: projectId as Id<"projects"> },
  );

  const recentModel = useQuery(
    api.models.getRecentModelForProject,
    shouldSkipQueries ? "skip" : { projectId: projectId as Id<"projects"> },
  );

  const datasets = useQuery(
    api.datasets.getProjectDatasets,
    shouldSkipQueries ? "skip" : { projectId: projectId as Id<"projects"> },
  );

  // Handle project not found case
  useEffect(() => {
    if (isAuthenticated && project === null) {
      toast.error("Project not found or has been deleted");
      router.push("/dashboard");
    }
  }, [isAuthenticated, project, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Project Topbar skeleton */}
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <Skeleton className="w-64 h-12 bg-bg-100" />
            <Skeleton className="w-32 h-10 rounded-md bg-bg-100" />
          </div>
        </div>

        {/* Metric cards skeleton */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
          <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
          <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
        </div>

        {/* Dataset table skeleton */}
        <div className="mt-6 flex-1 min-h-0 flex flex-col">
          <Skeleton className="w-full h-full bg-bg-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Show loading while checking if project exists
  if (isAuthenticated && project === undefined) {
    return (
      <div className="flex flex-col h-full">
        {/* Project Topbar skeleton */}
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <Skeleton className="w-64 h-12 bg-bg-100" />
            <Skeleton className="w-32 h-10 rounded-md bg-bg-100" />
          </div>
        </div>

        {/* Metric cards skeleton */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
          <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
          <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
        </div>

        {/* Dataset table skeleton */}
        <div className="mt-6 flex-1 min-h-0 flex flex-col">
          <Skeleton className="w-full h-full bg-bg-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Don't render anything if project doesn't exist (redirect will happen in useEffect)
  if (project === null) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <Authenticated>
        {/* Project Topbar */}
        <ProjectTopbar projectId={projectId} />

        {/* Show loading skeletons while data is loading */}
        {project === undefined ||
        modelStats === undefined ||
        datasetStats === undefined ||
        recentModel === undefined ||
        datasets === undefined ? (
          <>
            {/* Metric cards skeleton */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
              <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
              <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
            </div>

            {/* Dataset table skeleton */}
            <div className="mt-6 flex-1 min-h-0 flex flex-col">
              <Skeleton className="w-full h-full bg-bg-100 rounded-2xl" />
            </div>
          </>
        ) : (
          <>
            {/* Metric cards */}
            <MetricCardSection
              modelStats={modelStats}
              datasetStats={datasetStats}
              recentModel={recentModel}
            />
            {/* Dataset Uploaded Stat Card */}
            <DatasetUploadMetricCard datasets={datasets} />
          </>
        )}
      </Authenticated>

      <Unauthenticated>
        <div className="flex flex-col h-full items-center justify-center">
          <UserIcon
            className="w-10 h-10 text-text-inactive mb-4"
            strokeWidth={1.5}
          />
          <div className="text-text-inactive text-lg">
            Please sign in to view this project
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
};

export default ProjectPage;
