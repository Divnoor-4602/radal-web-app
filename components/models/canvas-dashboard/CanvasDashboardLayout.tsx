"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Palette, Layers, Settings, Save } from "lucide-react";
import React from "react";

// Dummy Canvas Sidebar
const CanvasSidebar = () => {
  return (
    <Sidebar className="bg-gray-900 border-r border-gray-700 py-4 min-h-screen px-3">
      <SidebarHeader className="mb-4">
        <div className="flex items-center gap-2">
          <Palette className="size-6 text-blue-400" />
          <p className="text-white text-xl font-bold">Canvas Mode</p>
        </div>
        <div className="bg-gray-700 w-full h-[1px] mt-4" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="flex flex-col gap-4">
          <SidebarMenuItem>
            <SidebarMenuButton className="text-white hover:bg-gray-700 p-3 rounded-lg">
              <Layers className="size-5" />
              <span className="text-sm font-medium">Components</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-white hover:bg-gray-700 p-3 rounded-lg">
              <Settings className="size-5" />
              <span className="text-sm font-medium">Properties</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-white hover:bg-gray-700 p-3 rounded-lg">
              <Save className="size-5" />
              <span className="text-sm font-medium">Save Model</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

// Canvas specific topbar/breadcrumb
const CanvasTopbarWithBreadcrumb = () => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-gray-50 border-b">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 bg-gray-300"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#" className="text-gray-600">
              🎨 Canvas Mode
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-900 font-medium">
              Model Creation
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded">
          🎯 Canvas Layout Active
        </span>
      </div>
    </header>
  );
};

// Main canvas dashboard layout
const CanvasDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "280px" } as React.CSSProperties}
    >
      <CanvasSidebar />
      <SidebarInset className="flex flex-col bg-white">
        <CanvasTopbarWithBreadcrumb />
        <main className="p-4 flex-1 min-h-0 bg-gray-50">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default CanvasDashboardLayout;
