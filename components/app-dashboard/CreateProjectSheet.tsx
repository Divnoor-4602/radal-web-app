"use client";

import React, { useState } from "react";
import {
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Sheet,
} from "../ui/sheet";
import { Plus } from "lucide-react";
import CustomButton from "../shared/CustomButton";
import CreateProjectForm from "./CreateProjectForm";

const CreateProjectSheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFormSuccess = () => {
    setIsOpen(false);
  };

  const handleFormCancel = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <CustomButton
          icon={<Plus className="size-4" />}
          className="gap-1.5"
          text="Create Project"
        />
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[800px] bg-bg-100 border-l border-border-default h-full flex flex-col">
        <div className="pb-0">
          <SheetHeader className="px-6">
            <SheetTitle className="text-2xl font-bold tracking-tighter text-text-primary">
              Create a new project
            </SheetTitle>
            <SheetDescription className="text-text-muted text-sm font-regular tracking-tight">
              Create a project to get started with Radal.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 px-6 pb-6">
          <CreateProjectForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateProjectSheet;
