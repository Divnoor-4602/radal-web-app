import MetricCard from "@/components/project-dashboard/MetricCard";
import DatasetUploadMetricCard from "@/components/project-dashboard/DatasetUploadMetricCard";
import ProjectTopbar from "@/components/project-dashboard/ProjectTopbar";
import { Brain, File, Sparkles } from "lucide-react";
import React from "react";

const ProjectPage = async ({ params }: { params: { projectId: string } }) => {
  const { projectId } = await params;

  return (
    <div className="flex flex-col h-full">
      {/* Project Topbar */}
      <ProjectTopbar projectId={projectId} />
      {/* Metric cards */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={<Brain />}
          title="Total Models"
          contentValue="2"
          contentDescription="models"
          pillText="Ready"
          pillType="success"
        />
        <MetricCard
          icon={<File />}
          title="Total Datasets"
          contentValue="5"
          contentDescription="datasets"
          pillText="Active"
          pillType="info"
        />
        <MetricCard
          icon={<Sparkles />}
          title="Currently Training"
          contentValue="Acme Support"
          contentValueClassName="text-text-primary text-[30px] font-bold tracking-tighter mt-3 mb-[3px]"
          contentDescription="tokenising"
          pillText="Training"
          pillType="info"
        />
      </div>
      {/* Dataset Uploaded Stat Card */}
      <DatasetUploadMetricCard />
    </div>
  );
};

export default ProjectPage;
