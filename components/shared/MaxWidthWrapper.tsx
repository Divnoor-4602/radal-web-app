import { cn } from "@/lib/utils";
import React from "react";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return <main className={cn("mx-auto w-full", className)}>{children}</main>;
};

export default MaxWidthWrapper;
