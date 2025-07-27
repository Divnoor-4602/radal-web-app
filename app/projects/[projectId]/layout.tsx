"use client";

import { usePathname } from "next/navigation";
import React from "react";
import ProjectDashboardLayout from "@/components/project-dashboard/ProjectDashboardLayout";
import CanvasDashboardLayout from "@/components/models/canvas-dashboard/CanvasDashboardLayout";

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Check if we're on the canvas page (but not on modelId pages which have their own layout)
  const isCanvasPage = pathname.includes("/models/new/canvas");
  const isModelIdPage = pathname.match(/\/models\/[^/]+$/);

  // ModelId pages have their own layout, so skip layout application for them
  if (isModelIdPage) {
    return <>{children}</>;
  }

  // Conditionally render layouts for other pages
  if (isCanvasPage) {
    return <CanvasDashboardLayout>{children}</CanvasDashboardLayout>;
  }

  return <ProjectDashboardLayout>{children}</ProjectDashboardLayout>;
};

export default ProjectLayout;
