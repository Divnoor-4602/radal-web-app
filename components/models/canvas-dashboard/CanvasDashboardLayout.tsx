"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import React from "react";
import CanvasSidebar from "@/components/models/canvas-dashboard/CanvasSidebar";
import { ArrowLeft, BrainCircuit, Sparkles } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { useRouter } from "next/navigation";

// Canvas specific topbar/breadcrumb
const CanvasTopbarWithActions = () => {
  const router = useRouter();
  return (
    <header className="flex justify-between shrink-0 items-center gap-2 px-6 py-5 bg-bg-100 border-b border-border-default">
      {/* Sidebar and back arrow actions */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1 text-text-muted" />
        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-4 bg-border-default"
        />
        {/* Go back to the previous page */}
        <ArrowLeft
          className="size-5 text-text-muted cursor-pointer"
          onClick={() => router.back()}
        />
      </div>
      {/* Train and Assistant actions */}
      <div className="flex items-center gap-3">
        {/* Open assistant tab */}
        <CustomButton
          text="Assistant"
          icon={<Sparkles className="size-4" strokeWidth={1.6} />}
          className="gap-1.5"
          variant="tertiary"
        />
        {/* Start training */}
        <CustomButton
          text="Train"
          icon={<BrainCircuit className="size-4" strokeWidth={1.6} />}
          className="gap-1.5"
        />
      </div>
    </header>
  );
};

// Main canvas dashboard layout
const CanvasDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "400px" } as React.CSSProperties}
    >
      <CanvasSidebar />
      <SidebarInset className="flex flex-col bg-white">
        <CanvasTopbarWithActions />
        {/* canvas */}
        <main className="p-4 flex-1 min-h-0 bg-bg-100">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default CanvasDashboardLayout;
