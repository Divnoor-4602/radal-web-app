import React from "react";
import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const { projectId } = await params;

  return <ProjectDashboard projectId={projectId} />;
};

export default ProjectPage;
