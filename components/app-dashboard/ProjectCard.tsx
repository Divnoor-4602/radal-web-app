import CustomPills from "@/components/shared/CustomPills";
import { Progress } from "@/components/ui/progress";
import { Folder } from "lucide-react";
import React from "react";

type ProjectCardProps = {
  cardTitle: string;
  date: string;
  pillType: "success" | "error" | "info";
  pillText: string;
  progressValue: number;
};

const ProjectCard = ({
  cardTitle,
  date,
  pillType,
  pillText,
  progressValue,
}: ProjectCardProps) => {
  return (
    <div className="py-5 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[380px] rounded-2xl border-highlight-top custom-project-card-drop-shadow to-[120%] from-[-15%]">
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
        <CustomPills text={pillText} type={pillType} />
      </div>
      {/* project content */}
      <div className="flex items-center px-4 mt-5">
        <Progress value={progressValue} className="w-full h-1 bg-[#333333]" />
      </div>
    </div>
  );
};

export default ProjectCard;
