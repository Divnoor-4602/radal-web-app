import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";

type TCustomButton = {
  text: string;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

const CustomButton = ({ text, className, icon, onClick }: TCustomButton) => {
  return (
    <Button
      className={cn(
        "rounded-[10px] bg-primary text-white px-4 py-1.5 text-sm font-medium tracking-tight flex items-center justify-center cursor-pointer custom-button-drop-shadow custom-button-inner-shadow",
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
