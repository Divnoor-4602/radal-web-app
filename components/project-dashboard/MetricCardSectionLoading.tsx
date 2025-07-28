import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MetricCardSectionLoading = () => {
  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
      {/* Model Analytics Card Skeleton */}
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
        <div className="relative pt-5 pb-2 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[380px] rounded-2xl border border-border-default custom-project-card-drop-shadow px-4 to-[120%] from-[-15%] mt-[1px]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <div className="flex items-baseline gap-1">
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Dataset Analytics Card Skeleton */}
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
        <div className="relative pt-5 pb-2 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[380px] rounded-2xl border border-border-default custom-project-card-drop-shadow px-4 to-[120%] from-[-15%] mt-[1px]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-36" />
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <div className="flex items-baseline gap-1">
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Training Analytics Card Skeleton */}
      <div className="relative lg:col-span-2 2xl:col-span-1">
        <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
        <div className="relative pt-5 pb-2 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[380px] rounded-2xl border border-border-default custom-project-card-drop-shadow px-4 to-[120%] from-[-15%] mt-[1px]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <div className="flex items-baseline gap-1">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCardSectionLoading;
