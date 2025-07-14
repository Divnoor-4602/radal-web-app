import { cn } from "@/lib/utils";
import React from "react";

type PillVariant = "success" | "error" | "info";

interface CustomPillsProps {
  children: React.ReactNode;
  variant?: PillVariant;
  className?: string;
  icon?: React.ReactElement;
  iconPosition?: "left" | "right";
  size?: "sm" | "default";
}

const variantStyles: Record<PillVariant, string> = {
  success: "bg-success border-success-border text-success-foreground",
  error: "bg-error border-error-border text-error-foreground",
  info: "bg-info border-info-border text-info-foreground",
};

const CustomPills = ({
  children,
  variant = "success",
  className,
  icon,
  iconPosition = "left",
  size = "sm",
}: CustomPillsProps) => {
  const content = (
    <>
      {iconPosition === "left" && icon}
      <span
        className={cn("font-medium", size === "sm" ? "text-[10px]" : "text-xs")}
      >
        {children}
      </span>
      {iconPosition === "right" && icon}
    </>
  );

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border custom-pills-inner-shadow",
        size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1",
        variantStyles[variant],
        className,
      )}
    >
      {content}
    </div>
  );
};

export default CustomPills;
