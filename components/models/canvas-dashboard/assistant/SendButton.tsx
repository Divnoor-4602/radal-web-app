"use client";

import { ArrowUp } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

const SendButton = () => {
  return (
    <motion.button
      className={cn(
        // Base button styles from shadcn
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Icon size variant
        "size-4",
        // Custom positioning and styling
        "absolute bottom-2 right-2 border border-primary bg-primary/30 hover:bg-primary !p-3 rounded-sm cursor-pointer",
      )}
    >
      <ArrowUp className="size-4" />
    </motion.button>
  );
};

export default SendButton;
