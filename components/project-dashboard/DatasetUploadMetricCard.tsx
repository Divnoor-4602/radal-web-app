"use client";

import React from "react";
import CustomButton from "@/components/shared/CustomButton";
import { Files, Filter, Ghost } from "lucide-react";
import MetricCardIcon from "./MetricCardIcon";
import { DataTable } from "@/components/project-dashboard/dataset-table/data-table";
import { columns } from "@/components/project-dashboard/dataset-table/columns";
import { transformDatasetsToTableRows } from "@/lib/validations/dataset.schema";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type DatasetUploadMetricCardProps = {
  datasets: Preloaded<typeof api.datasets.getProjectDatasets>;
};

const DatasetUploadMetricCard = ({
  datasets,
}: DatasetUploadMetricCardProps) => {
  // Use preloaded query - data is instantly available
  const datasetsData = usePreloadedQuery(datasets);

  // Transform the data for the table
  const tableData = transformDatasetsToTableRows(datasetsData);

  return (
    <div className="mt-6 flex-1 min-h-0 flex flex-col">
      <div className="relative flex-1 flex flex-col">
        {/* Background div with highlight border */}
        <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
        {/* Main card with precise positioning */}
        <div className="relative pt-5 bg-gradient-to-t from-bg-100 to-bg-400 w-full rounded-2xl border border-border-default px-4 to-[180%] from-[-15%] mt-[1px] flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <MetricCardIcon icon={<Files />} />
              <h3 className="text-xl font-semibold text-text-primary">
                Datasets Uploaded
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <CustomButton
                icon={<Filter className="size-4" />}
                text="Filter"
                variant="secondary"
              />
            </div>
          </div>

          {/* Content area with flex-1 to fill remaining space */}
          <div className="flex-1 min-h-0 pb-4">
            {datasetsData.length > 0 ? (
              <DataTable columns={columns} data={tableData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Ghost
                  className="size-12 text-text-muted mb-4"
                  strokeWidth={1.5}
                />
                <h4 className="text-lg font-medium text-text-muted mb-2">
                  No datasets uploaded
                </h4>
                <p className="text-sm text-text-inactive max-w-md">
                  Upload your first dataset to start training models and
                  analyzing your data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetUploadMetricCard;
