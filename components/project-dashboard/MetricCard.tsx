import React from "react";
import CustomPills from "@/components/shared/CustomPills";
import MetricCardIcon from "./MetricCardIcon";

interface MetricCardProps {
  icon: React.ReactElement;
  title: string;
  contentValue: string | number;
  contentDescription: string;
  pillText: string;
  pillType: "success" | "error" | "info";
  pillIcon?: React.ReactElement;
  contentValueClassName?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  contentValue,
  contentDescription,
  pillText,
  pillType,
  pillIcon,
  contentValueClassName,
}) => {
  return (
    <div className="pt-5 pb-2 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[380px] rounded-2xl border-highlight-top custom-project-card-drop-shadow px-4 to-[120%] from-[-15%]">
      {/* Card header */}
      <div className="flex items-center gap-3">
        <MetricCardIcon icon={icon} />
        <h2 className="text-xl font-medium tracking-tighter text-text-primary">
          {title}
        </h2>
      </div>
      {/* Card content */}
      <div className="flex items-baseline justify-between mt-4">
        <div className="flex items-baseline gap-1">
          <div
            className={
              contentValueClassName ||
              "text-text-primary text-[40px] font-bold tracking-tighter"
            }
          >
            {contentValue}
          </div>
          <div className="text-text-muted text-sm font-regular tracking-tight">
            {contentDescription}
          </div>
        </div>
        <CustomPills text={pillText} type={pillType} icon={pillIcon} />
      </div>
    </div>
  );
};

export default MetricCard;
