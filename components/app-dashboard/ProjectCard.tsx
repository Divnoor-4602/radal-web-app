import CustomPills from "@/components/shared/CustomPills";
import { Progress } from "@/components/ui/progress";
import { Folder } from "lucide-react";
import React from "react";
import { ProjectActions } from "./ProjectActions";

type ProjectCardProps = {
  projectId: string;
  cardTitle: string;
  date: string;
  pillText: string;
};

const ProjectCard = ({
  projectId,
  cardTitle,
  date,
  pillText,
}: ProjectCardProps) => {
  const getPillType = (status: string) => {
    switch (status) {
      case "valid":
        return "success";
      case "training":
        return "info";
      case "ready":
        return "success";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case "valid":
        return 25;
      case "training":
        return 50;
      case "ready":
        return 100;
      case "error":
        return 100;
      default:
        return 0;
    }
  };

  const getPillText = (status: string) => {
    switch (status) {
      case "valid":
        return "Valid";
      case "training":
        return "Training";
      case "ready":
        return "Ready";
      case "error":
        return "Error";
      default:
        return "Info";
    }
  };

  return (
    <div className="relative">
      {/* Background div with highlight border */}
      <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
      {/* Main card with precise positioning */}
      <div className="relative py-5 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[380px] rounded-2xl border border-border-default custom-project-card-drop-shadow to-[120%] from-[-15%] mt-[1px]">
        {/* project header */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Folder className="size-5 text-text-primary" />
            <div className="flex flex-col -space-y-1">
              <h2 className="text-text-primary text-base font-medium tracking-tight">
                {cardTitle}
              </h2>
              <p className="text-text-muted text-sm font-regular tracking-tight">
                {date}
              </p>
            </div>
          </div>
          {/* actions dropdown */}
          <ProjectActions projectId={projectId} />
        </div>
        {/* project content */}
        <div className="flex items-center gap-8 px-4 mt-5">
          <Progress
            value={getProgressValue(pillText)}
            className="w-full h-1 bg-[#333333]"
          />
          <CustomPills variant={getPillType(pillText)}>
            {getPillText(pillText)}
          </CustomPills>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
