import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";

type TCustomButton = {
  text: string;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "tertiary";
};

const CustomButton = ({
  text,
  className,
  icon,
  onClick,
  variant = "primary",
}: TCustomButton) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-bg-400 hover:bg-bg-400 border border-[#141414] text-text-primary custom-secondary-button-drop-shadow custom-secondary-button-inner-shadow";
      case "tertiary":
        return "bg-[#1C1717] hover:bg-[#1C1717] border border-bg-300 text-text-primary custom-tertiary-button-inner-shadow";
      case "primary":
      default:
        return "bg-primary hover:bg-primary border border-transparent text-white custom-button-drop-shadow custom-button-inner-shadow";
    }
  };

  return (
    <Button
      className={cn(
        "rounded-[10px] px-4 py-1.5 text-sm font-medium tracking-tight flex items-center justify-center cursor-pointer hover:opacity-100",
        getVariantStyles(),
        className,
      )}
      onClick={onClick}
    >
      {icon}
      {text}
    </Button>
  );
};

export default CustomButton;
