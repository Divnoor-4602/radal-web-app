"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import ProjectSidebar from "@/components/project-dashboard/ProjectSidebar";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Extract the topbar/breadcrumb into a component
const ProjectTopbarWithBreadcrumb = () => {
  const { projectId, modelId } = useParams<{
    projectId: string;
    modelId?: string;
  }>();
  const pathname = usePathname();

  // Fetch project data
  const project = useQuery(api.projects.getProjectById, {
    projectId: projectId as Id<"projects">,
  });

  // Determine current page type
  const isModelPage = pathname.includes("/models/") && modelId;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1 text-text-muted" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 bg-border-default"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard" className="text-text-inactive">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            {isModelPage ? (
              <BreadcrumbLink
                href={`/dashboard/${projectId}`}
                className="text-text-inactive"
              >
                {project?.name || "Loading..."}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{project?.name || "Loading..."}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {isModelPage && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/dashboard/${projectId}/models`}
                  className="text-text-inactive"
                >
                  Models
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Model {modelId}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};

// Main project dashboard layout
const ProjectDashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "300px" } as React.CSSProperties}
    >
      <ProjectSidebar />
      <SidebarInset className="flex flex-col">
        <ProjectTopbarWithBreadcrumb />
        <main className="p-6 flex-1 min-h-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProjectDashboardLayout;
