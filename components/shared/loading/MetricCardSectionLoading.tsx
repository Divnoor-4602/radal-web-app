import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const MetricCardSectionLoading = () => {
  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
      <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
      <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
    </div>
  );
};

export default MetricCardSectionLoading;
