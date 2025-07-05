"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Zod schema for form validation
const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Project description is required"),
});

type CreateProjectFormData = z.infer<typeof CreateProjectSchema>;

const CreateProjectForm = () => {
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject);

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const result = await createProject({
        name: data.name,
        description: data.description,
      });

      // Redirect to the specific project page
      router.push(`/dashboard/${result._id}`);
    } catch (error) {
      console.error("Failed to create project:", error);

      // Set server error on the form
      form.setError("root", {
        type: "server",
        message: "Failed to create project. Please try again.",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-12">
      <CardHeader className="space-y-3 pb-8">
        <CardTitle className="text-2xl font-semibold">
          Create New Project
        </CardTitle>
        <CardDescription className="text-base">
          Fill in the details below to create a new project.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">
                    Project Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project name"
                      {...field}
                      disabled={form.formState.isSubmitting}
                      className="h-11 px-4"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground">
                    Choose a descriptive name for your project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">
                    Project Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      {...field}
                      disabled={form.formState.isSubmitting}
                      rows={4}
                      className="px-4 py-3 resize-none"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground">
                    Provide a detailed description of your project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display root-level errors */}
            {form.formState.errors.root && (
              <div
                className="rounded-lg bg-destructive/15 p-4 text-sm text-destructive border border-destructive/20"
                role="alert"
              >
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Project"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={form.formState.isSubmitting}
                className="h-11 px-6 font-medium"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateProjectForm;
