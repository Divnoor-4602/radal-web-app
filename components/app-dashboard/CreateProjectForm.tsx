"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CreateProjectSchema,
  type TCreateProject,
} from "@/lib/validations/project.schema";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";

type CreateProjectFormProps = {
  onSuccess?: () => void;
};

const CreateProjectForm = ({ onSuccess }: CreateProjectFormProps) => {
  const createProject = useMutation(api.projects.createProject);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<TCreateProject>({
    resolver: zodResolver(CreateProjectSchema),
  });

  const onSubmit = async (data: TCreateProject) => {
    try {
      await createProject({
        name: data.name,
        description: data.description,
      });

      // Reset form and call success callback
      reset();
      onSuccess?.();
    } catch (error) {
      // Handle server errors
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create project. Please try again.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-full flex flex-col justify-between"
    >
      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col gap-2.5">
          <Label className="text-text-primary text-sm ml-1">Project Name</Label>
          <Input
            placeholder="Enter project name..."
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
            className={cn(
              "w-full bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none placeholder:text-sm placeholder:tracking-tight placeholder:text-[#666666] text-text-primary",
              errors.name
                ? "border-red-500"
                : "border-border-default focus:border-[#999999]",
            )}
          />
          {errors.name && (
            <span className="text-sm text-red-400 ml-1" role="alert">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <Label className="text-text-primary text-sm ml-1">Description</Label>
          <Textarea
            placeholder="Describe your project..."
            className={cn(
              "min-h-[100px] w-full bg-[#1C1717] focus:ring-0 focus:ring-offset-0 focus:outline-none placeholder:text-sm placeholder:tracking-tight placeholder:text-[#666666] text-text-primary resize-none",
              errors.description
                ? "border-red-500"
                : "border-border-default focus:border-[#999999]",
            )}
            {...register("description")}
            aria-invalid={errors.description ? "true" : "false"}
          />
          {errors.description && (
            <span className="text-sm text-red-400 ml-1" role="alert">
              {errors.description.message}
            </span>
          )}
        </div>

        {errors.root && (
          <div
            className="text-sm text-red-400 bg-red-950/20 border border-red-500/20 p-3 rounded-md ml-1"
            role="alert"
          >
            {errors.root.message}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Button
          className="w-full cursor-pointer bg-bg-100 text-text-primary hover:bg-bg-400 border-bg-400 border"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader className="size-4 animate-spin" /> Creating...
            </div>
          ) : (
            "Create Project"
          )}
        </Button>
        <Button
          className="w-full cursor-pointer bg-bg-200 text-text-primary hover:bg-bg-400/50 border-bg-400 border"
          type="submit"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CreateProjectForm;
