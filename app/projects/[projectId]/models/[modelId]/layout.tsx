"use client";

import React from "react";
import ProjectDashboardLayout from "@/components/project-dashboard/ProjectDashboardLayout";
import { ModelDashboardLayout } from "@/components/models/model-dashboard";
import MenuItems from "@/components/models/model-dashboard/menu/MenuItems";

const ModelLayout = ({ children }: { children: React.ReactNode }) => {
  // Additional menu items for the canvas topbar

  return (
    <ProjectDashboardLayout hideTopbar={true}>
      <ModelDashboardLayout additionalMenuItems={<MenuItems />}>
        {children}
      </ModelDashboardLayout>
    </ProjectDashboardLayout>
  );
};

export default ModelLayout;
