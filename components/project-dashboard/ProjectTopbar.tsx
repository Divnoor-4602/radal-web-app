"use client";

import CustomButton from "@/components/shared/CustomButton";
import { Plus } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

interface ProjectTopbarProps {
  projectId: string;
}

const ProjectTopbar = ({ projectId }: ProjectTopbarProps) => {
  const router = useRouter();

  const handleCreateModel = () => {
    router.push(`/projects/${projectId}/models/new/canvas`);
  };

  return (
    <div className="mt-7">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tighter">
          Good Evening, Div 👋
        </h1>
        <CustomButton
          icon={<Plus className="size-4" />}
          className="gap-1.5"
          text="Create Model"
          onClick={handleCreateModel}
        />
      </div>
    </div>
  );
};

export default ProjectTopbar;
