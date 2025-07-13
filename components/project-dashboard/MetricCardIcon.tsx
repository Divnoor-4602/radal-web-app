import React from "react";

interface MetricCardIconProps {
  icon: React.ReactElement;
}

const MetricCardIcon: React.FC<MetricCardIconProps> = ({ icon }) => {
  return (
    <div className="flex items-center justify-center size-12 bg-bg-400 border rounded-[10px] border-bg-200 project-dashboard-icon-drop-shadow project-dashboard-icon-inner-shadow [&>svg]:size-5 [&>svg]:text-text-primary">
      {icon}
    </div>
  );
};

export default MetricCardIcon;
