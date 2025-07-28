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
import React, { useCallback } from "react";
import ProjectSidebar from "@/components/project-dashboard/ProjectSidebar";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft } from "lucide-react";

// Extract the topbar/breadcrumb into a component
const ProjectTopbarWithBreadcrumb = () => {
  const { projectId, modelId } = useParams<{
    projectId: string;
    modelId?: string;
  }>();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();

  // Fetch project data only when authenticated
  const project = useQuery(
    api.projects.getProjectById,
    isAuthenticated ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  // Determine current page type
  const isModelPage = pathname.includes("/models/") && modelId;

  // Memoize the back navigation handler
  const handleBackClick = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger className="-ml-1 text-text-muted" />
        </TooltipTrigger>
        <TooltipContent
          className="bg-bg-400"
          arrowClassName="bg-bg-400 fill-bg-400"
        >
          Toggle sidebar
        </TooltipContent>
      </Tooltip>
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 bg-border-default"
      />
      {/* Go back to the previous page */}
      <Tooltip>
        <TooltipTrigger asChild>
          <ArrowLeft
            className="size-5 text-text-muted cursor-pointer hover:text-text-primary mr-2"
            onClick={handleBackClick}
          />
        </TooltipTrigger>
        <TooltipContent
          className="bg-bg-400"
          arrowClassName="bg-bg-400 fill-bg-400"
        >
          Go back to previous page
        </TooltipContent>
      </Tooltip>

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
                href={`/projects/${projectId}`}
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
                  href={`/projects/${projectId}/models`}
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
  hideTopbar = false,
}: {
  children: React.ReactNode;
  hideTopbar?: boolean;
}) => {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "300px" } as React.CSSProperties}
    >
      <ProjectSidebar />
      <SidebarInset className="flex flex-col">
        {!hideTopbar && <ProjectTopbarWithBreadcrumb />}
        <main className={`flex-1 min-h-0 ${hideTopbar ? "p-0" : "p-6"}`}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProjectDashboardLayout;
