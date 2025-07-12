import CustomButton from "@/components/shared/CustomButton";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import FoldersCustomIcon from "@/components/app-dashboard/FoldersCustomIcon";
import ProjectCard from "@/components/app-dashboard/ProjectCard";
import Topbar from "@/components/app-dashboard/Topbar";
import { Plus } from "lucide-react";
import React from "react";

const DashboardPage = () => {
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
          <CustomButton
            icon={<Plus className="size-4" />}
            className="gap-1.5"
            text="Create Project"
          />
        </div>

        {/* Project card grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-x-7 gap-y-10 mt-16">
          <ProjectCard
            cardTitle="Acme Support"
            date="3 days ago"
            pillType="info"
            pillText="Training"
            progressValue={50}
          />
          <ProjectCard
            cardTitle="Marketing Campaign"
            date="5 days ago"
            pillType="success"
            pillText="Ready"
            progressValue={85}
          />
          <ProjectCard
            cardTitle="Bug Fixes"
            date="1 week ago"
            pillType="error"
            pillText="Error"
            progressValue={45}
          />
          <ProjectCard
            cardTitle="Website Redesign"
            date="2 days ago"
            pillType="info"
            pillText="Training"
            progressValue={60}
          />
          <ProjectCard
            cardTitle="Database Migration"
            date="4 days ago"
            pillType="success"
            pillText="Ready"
            progressValue={100}
          />
          <ProjectCard
            cardTitle="API Integration"
            date="1 day ago"
            pillType="error"
            pillText="Error"
            progressValue={25}
          />
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default DashboardPage;
