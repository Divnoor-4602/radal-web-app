"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Settings,
  Calendar,
  Database,
  Brain,
  FileText,
  HardDrive,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function ProjectDashboard({ projectId }: { projectId: string }) {
  const router = useRouter();

  // Fetch project data
  const project = useQuery(api.projects.getProjectById, {
    projectId: projectId as Id<"projects">,
  });

  // Fetch models for this project
  const models = useQuery(api.models.getModelsByProject, {
    projectId: projectId as Id<"projects">,
  });

  // Fetch datasets for this project
  const datasets = useQuery(api.datasets.getDatasetsByProject, {
    projectId: projectId as Id<"projects">,
  });

  // Get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "valid":
        return "outline";
      case "training":
        return "default";
      case "ready":
        return "default";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Format date helper
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Loading state
  if (project === undefined) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <SidebarTrigger />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Loading skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Project not found
  if (project === null) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <SidebarTrigger />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </div>

              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Project Not Found
                </h1>
                <p className="text-gray-500 mb-6">
                  The project you&apos;re looking for doesn&apos;t exist or you
                  don&apos;t have access to it.
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <SidebarTrigger />
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>

            {/* Project Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {project.name}
                  </h1>
                  <p className="text-gray-600 mt-1">{project.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created {formatDate(project.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Last updated {formatDate(project.updatedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(project.status)}>
                    {project.status}
                  </Badge>
                  <Button
                    onClick={() =>
                      router.push(`/dashboard/${projectId}/create-model`)
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Model
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Models
                  </CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {models?.length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Datasets
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {datasets?.length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Project Status
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {project.status}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Models and Datasets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Models Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Models
                </h2>
                <div className="space-y-4">
                  {models && models.length > 0 ? (
                    models.map((model) => (
                      <Card key={model._id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {model.title}
                            </CardTitle>
                            <Badge variant={getStatusVariant(model.status)}>
                              {model.status}
                            </Badge>
                          </div>
                          {model.description && (
                            <p className="text-sm text-gray-600">
                              {model.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Base Model:
                              </span>
                              <span className="text-sm font-medium">
                                {model.modelId}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Quantization:
                              </span>
                              <span className="text-sm font-medium">
                                {model.quant.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Created:
                              </span>
                              <span className="text-sm">
                                {formatDate(model.createdAt)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No models yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Create your first model to get started with training.
                        </p>
                        <Button
                          onClick={() =>
                            router.push(`/dashboard/${projectId}/create-model`)
                          }
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create Model
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Datasets Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Datasets
                </h2>
                <div className="space-y-4">
                  {datasets && datasets.length > 0 ? (
                    datasets.map((dataset) => (
                      <Card key={dataset._id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {dataset.title}
                            </CardTitle>
                            <Badge variant={getStatusVariant(dataset.status)}>
                              {dataset.status}
                            </Badge>
                          </div>
                          {dataset.description && (
                            <p className="text-sm text-gray-600">
                              {dataset.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                File:
                              </span>
                              <span className="text-sm font-medium">
                                {dataset.originalFilename}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Size:
                              </span>
                              <span className="text-sm">
                                {formatFileSize(dataset.fileSize)}
                              </span>
                            </div>
                            {dataset.rowCount && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  Rows:
                                </span>
                                <span className="text-sm">
                                  {dataset.rowCount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {dataset.columnCount && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  Columns:
                                </span>
                                <span className="text-sm">
                                  {dataset.columnCount}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Uploaded:
                              </span>
                              <span className="text-sm">
                                {formatDate(dataset.createdAt)}
                              </span>
                            </div>
                            {/* TODO: Add badges showing which models use this dataset */}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No datasets yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Upload datasets to start training models.
                        </p>
                        <Button
                          onClick={() =>
                            router.push(`/dashboard/${projectId}/create-model`)
                          }
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Upload Dataset
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
