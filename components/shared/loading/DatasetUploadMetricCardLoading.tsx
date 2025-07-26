import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const DatasetUploadMetricCardLoading = () => {
  return (
    <div className="mt-6 flex-1 min-h-0 flex flex-col">
      <Skeleton className="w-full h-full bg-bg-100 rounded-2xl" />
    </div>
  );
};

export default DatasetUploadMetricCardLoading; 