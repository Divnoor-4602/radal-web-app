"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { useWindowSize } from "@react-hook/window-size";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const [width] = useWindowSize();

  if (width > 1700) {
    return (
      <main
        className={cn("mx-auto max-w-screen-2xl px-2.5 md:px-20", className)}
      >
        {children}
      </main>
    );
  }

  return <main className={cn("mx-auto w-full", className)}>{children}</main>;
};

export default MaxWidthWrapper;
