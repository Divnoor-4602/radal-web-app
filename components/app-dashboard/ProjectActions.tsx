"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

type ProjectActionsProps = {
  projectId: string;
};

export const ProjectActions: React.FC<ProjectActionsProps> = ({
  projectId,
}) => {
  const deleteProject = useMutation(api.projects.deleteProject);

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling to parent onClick
    try {
      await deleteProject({ projectId: projectId as Id<"projects"> });
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project",
      );
    }
  };

  const handleDropdownClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling when dropdown is opened
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleDropdownClick}
          className={cn(
            "h-8 w-8 p-0 bg-transparent  focus:ring-0 focus:ring-offset-0 focus:outline-none group hover:bg-text-primary",
            "data-[state=open]:ring-0 data-[state=open]:ring-offset-0",
          )}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-text-inactive group-hover:text-text-primary transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-bg-100 border-border-default"
      >
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-sm font-medium tracking-tight">
            Delete project
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
