"use client";

import { formatRelativeTime } from "@/lib/utils";
import React from "react";
import ProjectCard from "./ProjectCard";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GhostIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type ProjectSectionProps = {
  projects: Preloaded<typeof api.projects.getUserProjects>;
};

const ProjectSection = ({ projects }: ProjectSectionProps) => {
  const projectData = usePreloadedQuery(projects);
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <>
      {/* Project card grid */}
      <div className="grid grid-cols-[repeat(auto-fill,380px)] gap-x-7 gap-y-10 mt-16 justify-start">
        {/* Render actual projects from the database */}
        {projectData.map((project) => (
          <div
            key={project._id}
            onClick={() => handleProjectClick(project._id)}
            className="cursor-pointer"
          >
            <ProjectCard
              cardTitle={project.name}
              date={formatRelativeTime(project.createdAt)}
              pillText={project.status}
            />
          </div>
        ))}

        {/* Show message if no projects */}
        {projectData.length === 0 && (
          <div className="col-span-full text-center py-16 flex flex-col items-center justify-center gap-4">
            <GhostIcon
              className="w-10 h-10 text-text-inactive"
              strokeWidth={1.5}
            />
            <div className="text-text-inactive text-lg">
              No projects yet. Create your first project to get started!
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectSection;
