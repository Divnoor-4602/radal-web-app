"use client";

import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderOpen,
  Code,
  Database,
  Globe,
  FileText,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Dashboard() {
  const router = useRouter();
  const projects = useQuery(api.projects.getUserProjects);

  const handleCreateProject = () => {
    router.push("/dashboard/create-project");
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/dashboard/${projectId}`);
  };

  // Helper function to get project icon (you can customize this based on project type later)
  const getProjectIcon = (index: number) => {
    const icons = [Globe, FolderOpen, Code, Database, FileText];
    return icons[index % icons.length];
  };

  // Helper function to format relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <MaxWidthWrapper>
      <div className="py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your projects and monitor their progress
            </p>
          </div>
          <Button
            onClick={handleCreateProject}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Project
          </Button>
        </div>

        <Separator className="mb-8" />

        {/* Projects Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>

          {/* Loading state */}
          {projects === undefined && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-200 rounded-lg w-10 h-10" />
                      <div className="flex-1 min-w-0">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Projects grid */}
          {projects && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => {
                const IconComponent = getProjectIcon(index);
                return (
                  <Card
                    key={project._id}
                    className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => handleProjectClick(project._id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            Updated {formatRelativeTime(project.createdAt)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty state fallback */}
          {projects && projects.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Get started by creating your first project. You can build and
                manage your ML models here.
              </p>
              <Button
                onClick={handleCreateProject}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
