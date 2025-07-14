"use client";

import { usePathname } from "next/navigation";
import React from "react";
import ProjectDashboardLayout from "@/components/project-dashboard/ProjectDashboardLayout";
import CanvasDashboardLayout from "@/components/models/canvas-dashboard/CanvasDashboardLayout";

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Check if we're on the canvas page
  const isCanvasPage = pathname.includes("/models/new/canvas");

  // Conditionally render layouts
  if (isCanvasPage) {
    return <CanvasDashboardLayout>{children}</CanvasDashboardLayout>;
  }

  return <ProjectDashboardLayout>{children}</ProjectDashboardLayout>;
};

export default ProjectLayout;
