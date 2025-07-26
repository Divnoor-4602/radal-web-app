"use client";

import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import FoldersCustomIcon from "@/components/app-dashboard/FoldersCustomIcon";
import ProjectCard from "@/components/app-dashboard/ProjectCard";
import Topbar from "@/components/app-dashboard/Topbar";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProjectDashboardLoading from "@/components/shared/loading/ProjectDashboardLoading";
import { formatRelativeTime } from "@/lib/utils";
import CreateProjectSheet from "@/components/app-dashboard/CreateProjectSheet";
import Link from "next/link";

const DashboardPage = () => {
  // Fetch projects using the client-side query
  const projects = useQuery(api.projects.getUserProjects);

  // Show loading state while Convex query is fetching data
  if (projects === undefined) {
    return <ProjectDashboardLoading />;
  }

  return (
    <main className="bg-bg-200 min-h-screen">
      <MaxWidthWrapper className="p-5 border-b border-border-default">
        {/* Topbar */}
        <Topbar />
      </MaxWidthWrapper>
      {/* project cards */}
      <MaxWidthWrapper className="px-5 py-8">
        {/* Grid Heading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FoldersCustomIcon />
            <h1 className="text-text-primary text-3xl font-bold tracking-tighter">
              Project Dashboard
            </h1>
          </div>
          {/* Add project button */}
          <CreateProjectSheet />
        </div>

        {/* Project card grid */}
        <div className="grid grid-cols-[repeat(auto-fill,380px)] gap-x-7 gap-y-10 mt-16 justify-start">
          {/* Render actual projects from the database */}
          {projects.map((project) => (
            <Link
              href={`/dashboard/${project._id}`}
              key={project._id}
              className="cursor-pointer"
            >
              <ProjectCard
                key={project._id}
                cardTitle={project.name}
                date={formatRelativeTime(project.createdAt)}
                pillText={project.status}
              />
            </Link>
          ))}

          {/* Show message if no projects */}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-text-secondary text-lg">
                No projects yet. Create your first project to get started!
              </div>
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default DashboardPage;
