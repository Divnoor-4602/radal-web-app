"use client";

import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import FoldersCustomIcon from "@/components/app-dashboard/FoldersCustomIcon";
import Topbar from "@/components/app-dashboard/Topbar";
import React from "react";
import {
  useQuery,
  useConvexAuth,
  Authenticated,
  Unauthenticated,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import ProjectCard from "@/components/app-dashboard/ProjectCard";
import CreateProjectSheet from "@/components/app-dashboard/CreateProjectSheet";
import { UserIcon, GhostIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  // Use the "skip" pattern to wait for authentication
  const projects = useQuery(
    api.projects.getUserProjects,
    isAuthenticated ? {} : "skip",
  );

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <main className="bg-bg-200 min-h-screen">
        <MaxWidthWrapper className="p-5 border-b border-border-default">
          <Topbar />
        </MaxWidthWrapper>
        <MaxWidthWrapper className="px-5 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FoldersCustomIcon />
              <h1 className="text-text-primary text-3xl font-bold tracking-tighter">
                Project Dashboard
              </h1>
            </div>
          </div>
          {/* Loading skeletons */}
          <div className="grid grid-cols-[repeat(auto-fill,380px)] gap-x-7 gap-y-10 mt-16 justify-start">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-[380px] h-48 bg-bg-200" />
            ))}
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  return (
    <main className="bg-bg-200 min-h-screen">
      <MaxWidthWrapper className="p-5 border-b border-border-default">
        <Topbar />
      </MaxWidthWrapper>
      <MaxWidthWrapper className="px-5 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FoldersCustomIcon />
            <h1 className="text-text-primary text-3xl font-bold tracking-tighter">
              Project Dashboard
            </h1>
          </div>
          <Authenticated>
            <CreateProjectSheet />
          </Authenticated>
        </div>

        <Authenticated>
          <div className="grid grid-cols-[repeat(auto-fill,380px)] gap-x-7 gap-y-10 mt-16 justify-start">
            {projects === undefined ? (
              // Loading state
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-[380px] h-48 bg-bg-200" />
              ))
            ) : projects.length === 0 ? (
              // No projects state
              <div className="col-span-full text-center py-16 flex flex-col items-center justify-center gap-4">
                <GhostIcon
                  className="w-10 h-10 text-text-inactive"
                  strokeWidth={1.5}
                />
                <div className="text-text-inactive text-lg">
                  No projects yet. Create your first project to get started!
                </div>
              </div>
            ) : (
              // Render projects
              projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => handleProjectClick(project._id)}
                  className="cursor-pointer"
                >
                  <ProjectCard
                    cardTitle={project.name}
                    date={formatRelativeTime(project.createdAt)}
                    pillText={project.status}
                  />
                </div>
              ))
            )}
          </div>
        </Authenticated>

        <Unauthenticated>
          <div className="grid grid-cols-[repeat(auto-fill,380px)] gap-x-7 gap-y-10 mt-16 justify-start">
            <div className="col-span-full text-center py-16 flex flex-col items-center justify-center gap-4">
              <UserIcon
                className="w-10 h-10 text-text-inactive"
                strokeWidth={1.5}
              />
              <div className="text-text-inactive text-lg">
                Please sign in to view your projects
              </div>
            </div>
          </div>
        </Unauthenticated>
      </MaxWidthWrapper>
    </main>
  );
};

export default DashboardPage;
