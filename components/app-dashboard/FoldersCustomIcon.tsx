import { Folders } from "lucide-react";
import React from "react";

const FoldersCustomIcon = () => {
  return (
    <div className="flex items-center justify-center size-12 bg-bg-300 border rounded-[10px] border-bg-200 project-dashboard-icon-drop-shadow project-dashboard-icon-inner-shadow">
      <Folders className="size-5 text-text-primary" />
    </div>
  );
};

export default FoldersCustomIcon;
