"use client";

import React from "react";
import CustomButton from "@/components/shared/CustomButton";
import { Files, Filter, Ghost } from "lucide-react";
import MetricCardIcon from "./MetricCardIcon";
import { DataTable } from "@/components/project-dashboard/dataset-table/data-table";
import { columns } from "@/components/project-dashboard/dataset-table/columns";
import { Id } from "@/convex/_generated/dataModel";
import { transformDatasetsToTableRows } from "@/lib/validations/dataset.schema";
import DatasetUploadMetricCardLoading from "@/components/shared/loading/DatasetUploadMetricCardLoading";

type Dataset = {
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
};

type DatasetUploadMetricCardProps = {
  datasets: Dataset[] | undefined;
  isLoading?: boolean;
};

const DatasetUploadMetricCard = ({
  datasets,
  isLoading = false,
}: DatasetUploadMetricCardProps) => {
  if (isLoading) {
    return <DatasetUploadMetricCardLoading />;
  }
  // Transform the data for the table
  const tableData = datasets ? transformDatasetsToTableRows(datasets) : [];

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
              <h2 className="text-2xl font-medium tracking-tighter text-text-primary">
                Dataset Uploaded
              </h2>
            </div>
            {/* Secondary Button */}
            <CustomButton
              text="Filter"
              variant="secondary"
              className="gap-2"
              icon={<Filter className="size-4" />}
              disableShadow={true}
            />
          </div>
          {/* Data Table */}
          <div className="pb-4 flex-1 flex flex-col min-h-0">
            {tableData.length > 0 ? (
              <DataTable columns={columns} data={tableData} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-secondary">
                <div className="text-center">
                  <Ghost className="size-8 text-text-inactive mx-auto mb-2" />
                  <h3 className="text-xl font-medium mb-3">
                    No datasets uploaded
                  </h3>
                  <p className="text-base text-text-inactive max-w-md">
                    Upload your first dataset to get started with training
                    models. Your datasets will appear here once uploaded.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetUploadMetricCard;
