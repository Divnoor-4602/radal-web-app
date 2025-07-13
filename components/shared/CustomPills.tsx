import { cn } from "@/lib/utils";
import React from "react";

type CustomPillsProps = {
  text: string;
  icon?: React.ReactElement;
  className?: string;
  type?: "success" | "error" | "info";
};

const CustomPills = ({
  text,
  icon,
  className,
  type = "success",
}: CustomPillsProps) => {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-success border-success-border text-success-foreground";
      case "error":
        return "bg-error border-error-border text-error-foreground";
      case "info":
        return "bg-info border-info-border text-info-foreground";
      default:
        return "bg-success border-success-border text-success-foreground";
    }
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center gap-2 border px-2 text-[10px] font-medium custom-pills-inner-shadow",
        getTypeStyles(),
        className,
      )}
    >
      {icon && (
        <div className="size-8 flex items-center justify-center [&>svg]:size-8">
          {icon}
        </div>
      )}
      {text}
    </div>
  );
};

export default CustomPills;
