import React from "react";
import { ProjectPageContent } from "@/components/dashboard/ProjectPageContent";

interface CreateModelPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const CreateModelPage = async ({ params }: CreateModelPageProps) => {
  const { projectId } = await params;

  return <ProjectPageContent projectId={projectId} />;
};

export default CreateModelPage;
