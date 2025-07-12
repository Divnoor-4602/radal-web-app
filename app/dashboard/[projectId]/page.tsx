import CustomButton from "@/components/shared/CustomButton";
import MetricCard from "@/components/project-dashboard/MetricCard";
import DatasetUploadMetricCard from "@/components/project-dashboard/DatasetUploadMetricCard";
import { Plus, Brain, File, Sparkles } from "lucide-react";
import React from "react";

const ProjectPage = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tighter">
            Good Evening, Div 👋
          </h1>
          <CustomButton
            icon={<Plus className="size-4" />}
            className="gap-1.5"
            text="Create Model"
          />
        </div>
      </div>
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
