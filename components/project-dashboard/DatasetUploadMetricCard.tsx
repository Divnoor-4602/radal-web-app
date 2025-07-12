import React from "react";
import CustomButton from "@/components/shared/CustomButton";
import { Files, Filter } from "lucide-react";
import MetricCardIcon from "./MetricCardIcon";
import { DataTable } from "@/components/project-dashboard/dataset-table/data-table";
import { columns } from "@/components/project-dashboard/dataset-table/columns";
import { dummyDatasetData } from "@/constants";

const DatasetUploadMetricCard = () => {
  return (
    <div className="relative mt-6 flex-1 min-h-0">
      {/* Background div with highlight border */}
      <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
      {/* Main card with precise positioning */}
      <div className="relative pt-5 pb-2 bg-gradient-to-t flex-1 from-bg-100 to-bg-400 w-full rounded-2xl border border-border-default px-4 to-[180%] from-[-15%] min-h-0 mt-[1px]">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <MetricCardIcon icon={<Files />} />
            <h2 className="text-2xl font-medium tracking-tighter text-text-primary">
              Dataset Uploaded
            </h2>
          </div>
          {/* Secondary Button */}
          <CustomButton
            text="Filter"
            variant="secondary"
            className="gap-1.5"
            icon={<Filter />}
          />
        </div>
        {/* Data Table */}
        <div className="pb-4">
          <DataTable columns={columns} data={dummyDatasetData} />
        </div>
      </div>
    </div>
  );
};

export default DatasetUploadMetricCard;
