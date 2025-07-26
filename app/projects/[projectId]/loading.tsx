import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const loading = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Project Topbar skeleton */}
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <Skeleton className="w-64 h-12 bg-bg-100" />
          <Skeleton className="w-32 h-10 rounded-md bg-bg-100" />
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
        <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
        <Skeleton className="w-full h-[150px] rounded-2xl bg-bg-100" />
      </div>

      {/* Dataset table skeleton */}
      <div className="mt-6 flex-1 min-h-0 flex flex-col">
        <Skeleton className="w-full h-full bg-bg-100 rounded-2xl" />
      </div>
    </div>
  );
};

export default loading;
