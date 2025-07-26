"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

type TCustomButton = {
  text: string;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "tertiary";
  disableShadow?: boolean;
  isActive?: boolean;
};

const CustomButton = React.forwardRef<
  HTMLButtonElement,
  TCustomButton &
    Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      | "onDrag"
      | "onDragStart"
      | "onDragEnd"
      | "onAnimationStart"
      | "onAnimationEnd"
      | "onAnimationIteration"
    >
>(
  (
    {
      text,
      className,
      icon,
      onClick,
      variant = "primary",
      disableShadow = false,
      isActive = false,
      ...props
    },
    ref,
  ) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "secondary":
          return {
            button:
              "bg-bg-400 hover:bg-bg-400 border border-[#141414] text-text-primary custom-secondary-button-drop-shadow custom-secondary-button-inner-shadow",
            shadow: "bg-[#0a0a0a] border border-[#141414]",
          };
        case "tertiary":
          return {
            button: `bg-[#1C1717] hover:bg-[#1C1717] border border-bg-300 ${isActive ? "text-yellow-200" : "text-text-primary"} custom-tertiary-button-inner-shadow hover:text-yellow-200`,
            shadow: "bg-white/20 border border-bg-300",
          };
        case "primary":
        default:
          return {
            button:
              "bg-primary hover:bg-primary border border-transparent text-white custom-button-drop-shadow custom-button-inner-shadow",
            shadow:
              "bg-violet-300 border border-primary custom-button-inner-shadow",
          };
      }
    };

    const styles = getVariantStyles();

    return (
      <div className={cn("relative inline-block", className)}>
        {/* Shadow/Bottom div */}
        {!disableShadow && (
          <motion.div
            className={cn("absolute inset-0 rounded-[10px]", styles.shadow)}
          />
        )}

        {/* Main button */}
        <motion.button
          ref={ref}
          className={cn(
            "relative rounded-[10px] px-4 py-1.5 text-sm font-medium tracking-tight flex items-center justify-center cursor-pointer hover:opacity-100 gap-1",
            styles.button,
          )}
          onClick={onClick}
          initial={{ y: 0 }}
          whileHover={!disableShadow && !isActive ? { y: -3 } : {}}
          whileTap={{ y: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          {...props}
        >
          {icon}
          {text}
        </motion.button>
      </div>
    );
  },
);

CustomButton.displayName = "CustomButton";

export default CustomButton;
