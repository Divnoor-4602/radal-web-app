import React from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import CustomPills from "@/components/shared/CustomPills";

type DatasetItemProps = {
  datasetId: Id<"datasets">;
  truncateText: (text: string, maxLength?: number) => string;
};

const DatasetItem = ({ datasetId, truncateText }: DatasetItemProps) => {
  const { isAuthenticated } = useConvexAuth();

  const dataset = useQuery(
    api.datasets.getDatasetById,
    isAuthenticated ? { datasetId } : "skip",
  );

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-text-primary flex-1">
        {dataset ? truncateText(dataset.title) : "Loading..."}
      </span>
      {dataset && (
        <CustomPills
          variant="neutral"
          size="sm"
          className="tracking-tighter py-[1px] px-2 text-xs"
        >
          {dataset.rowCount || 0} rows
        </CustomPills>
      )}
    </div>
  );
};

export default DatasetItem;
