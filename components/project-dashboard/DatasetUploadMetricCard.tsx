"use client";

import React from "react";
import { Files, Ghost } from "lucide-react";
import MetricCardIcon from "./MetricCardIcon";
import { Id } from "@/convex/_generated/dataModel";
import { DataTable } from "./dataset-table/data-table";
import { columns } from "./dataset-table/columns";
import {
  transformDatasetsToTableRows,
  ConvexDataset,
} from "@/lib/validations/dataset.schema";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Type for direct query result instead of Preloaded type
type DatasetData = {
  _id: Id<"datasets">;
  title: string;
  description: string | undefined;
  originalFilename: string;
  fileSize: number;
  rowCount: number | undefined;
  columnCount: number | undefined;
  headers: string[] | undefined;
  createdAt: number;
  storageUrl: string | undefined;
}[];

type DatasetUploadMetricCardProps = {
  datasets: DatasetData | undefined;
};

const DatasetUploadMetricCard = ({
  datasets,
}: DatasetUploadMetricCardProps) => {
  // Data is already available as direct query result
  const datasetsData = datasets ?? [];

  // Filter state
  const [modelFilter, setModelFilter] = React.useState("");

  // Transform the data for the table (convert from Id<"datasets"> to string)
  const tableData = transformDatasetsToTableRows(
    datasetsData.map((dataset) => ({
      ...dataset,
      _id: dataset._id as string,
    })) as ConvexDataset[],
  );

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
              <Input
                placeholder="Filter models..."
                value={modelFilter}
                onChange={(event) => setModelFilter(event.target.value)}
                className={cn(
                  "w-56 bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none placeholder:text-sm placeholder:tracking-tight placeholder:text-[#666666] text-text-primary border-border-default focus:border-[#999999]",
                )}
              />
            </div>
          </div>

          {/* Content area with flex-1 to fill remaining space */}
          <div className="flex-1 min-h-0 pb-4">
            {datasetsData.length > 0 ? (
              <DataTable
                columns={columns}
                data={tableData}
                modelFilter={modelFilter}
              />
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
