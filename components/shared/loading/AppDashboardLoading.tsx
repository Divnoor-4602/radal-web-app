import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const DashboardLoading = () => {
  return (
    <main className="bg-bg-200 min-h-screen">
      <MaxWidthWrapper className="p-5 border-b border-border-default">
        {/* Minimal topbar skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full bg-bg-100" />
            <Skeleton className="w-32 h-8 bg-bg-100" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full bg-bg-100" />
        </div>
      </MaxWidthWrapper>

      <MaxWidthWrapper className="px-5 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-md bg-bg-100" />
            <Skeleton className="w-64 h-12 bg-bg-100" />
          </div>
          <Skeleton className="w-36 h-10 rounded-md bg-bg-100" />
        </div>

        {/* Minimal project grid skeleton - fewer items to reduce visual impact */}
        <div className="grid grid-cols-[repeat(auto-fill,380px)] gap-x-7 gap-y-10 mt-16 justify-start">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-[380px] h-[120px] rounded-2xl bg-bg-100"
            />
          ))}
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default DashboardLoading;
