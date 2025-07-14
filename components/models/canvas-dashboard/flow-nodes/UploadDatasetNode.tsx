import React from "react";
import { DatasetNodeData } from "@/lib/stores/flowStore";

interface UploadDatasetNodeProps {
  id: string;
  data: DatasetNodeData;
}

export const UploadDatasetNode: React.FC<UploadDatasetNodeProps> = ({
  // id, // TODO: Use id when needed
  data,
}) => {
  return (
    <div className="relative">
      {/* Background div with highlight border */}
      <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
      {/* Main card with precise positioning */}
      <div className="relative pt-5 pb-2 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[380px] rounded-2xl border border-border-default custom-project-card-drop-shadow px-4 to-[120%] from-[-15%] mt-[1px]">
        {/* Card header */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-medium tracking-tighter text-text-primary">
            {data.title}
          </h2>
        </div>
        {/* Card content */}
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-text-muted text-sm">{data.description}</p>
          {data.datasetId && (
            <div className="text-xs text-text-inactive">
              ID: {data.datasetId}
            </div>
          )}
          {data.stats && (
            <div className="text-xs text-text-inactive">
              Rows: {data.stats.rows} | Columns: {data.stats.columns}
            </div>
          )}
          {data.isTrained && (
            <div className="text-xs text-green-500 font-medium">✅ Trained</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadDatasetNode;
