import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

// Skeleton version of ProjectCard
const ProjectCardSkeleton = () => (
  <Skeleton className="w-[380px] h-[120px] rounded-2xl bg-bg-100" />
);

// Skeleton version of Topbar
const TopbarSkeleton = () => (
  <div className="flex items-center justify-between">
    {/* Left side - Logo and title */}
    <div className="flex items-center gap-3">
      <Skeleton className="w-8 h-8 rounded-full bg-bg-100" />
      <Skeleton className="w-32 h-8 bg-bg-100" />
    </div>
    {/* Right side - User menu */}
    <div className="flex items-center gap-3">
      <Skeleton className="w-8 h-8 rounded-full bg-bg-100" />
    </div>
  </div>
);

const ProjectDashboardLoading = () => {
  return (
    <main className="bg-bg-200 min-h-screen">
      <MaxWidthWrapper className="p-5 border-b border-border-default">
        {/* Topbar skeleton */}
        <TopbarSkeleton />
      </MaxWidthWrapper>

      {/* Project cards section */}
      <MaxWidthWrapper className="px-5 py-8">
        {/* Grid Heading skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Folders icon skeleton */}
            <Skeleton className="size-12 rounded-md bg-bg-100" />
            {/* Page title skeleton */}
            <Skeleton className="w-64 h-12 bg-bg-100" />
          </div>
          {/* Add project button skeleton */}
          <Skeleton className="w-36 h-10 rounded-md bg-bg-100" />
        </div>

        {/* Project card grid skeleton */}
        <div className="grid grid-cols-[repeat(auto-fill,380px)] gap-x-7 gap-y-10 mt-16 justify-start">
          {/* Render 6 skeleton project cards */}
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default ProjectDashboardLoading;
