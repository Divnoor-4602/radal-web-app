import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import FoldersCustomIcon from "@/components/app-dashboard/FoldersCustomIcon";
import Topbar from "@/components/app-dashboard/Topbar";
import React from "react";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getAuthToken } from "@/lib/actions/auth.actions";
import ProjectSection from "@/components/app-dashboard/ProjectSection";
import CreateProjectSheet from "@/components/app-dashboard/CreateProjectSheet";

// Force dynamic rendering since we're using authentication
export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  const token = await getAuthToken();

  const projects = await preloadQuery(
    api.projects.getUserProjects,
    {},
    {
      token,
    },
  );

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
        <ProjectSection projects={projects} />
      </MaxWidthWrapper>
    </main>
  );
};

export default DashboardPage;
