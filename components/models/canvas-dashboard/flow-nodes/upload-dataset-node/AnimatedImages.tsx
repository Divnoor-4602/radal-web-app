"use client";

import React, { FC } from "react";
import { motion } from "motion/react";

interface AnimatedImagesProps {
  isHovered: boolean;
  isDragActive: boolean;
  translateFileImages: boolean;
  translateBackIntoView?: boolean; // Bring images back from top
  disableHoverEffects?: boolean; // Disable hover animations
}

const AnimatedImages: FC<AnimatedImagesProps> = ({
  isHovered,
  isDragActive,
  translateFileImages,
  translateBackIntoView = false,
  disableHoverEffects = false,
}) => {
  // Trigger animations when either hovering or dragging (but not if disabled)
  const doAnimate = !disableHoverEffects && (isHovered || isDragActive);

  // translate out of view
  const doTranslate = translateFileImages;

  // translate back into view from top
  const doTranslateBack = translateBackIntoView;

  return (
    <motion.div
      className="w-16 h-16 relative flex items-center justify-center"
      animate={{
        y: doTranslateBack ? 0 : doTranslate ? -200 : 0,
        scale: doTranslateBack ? 1 : doTranslate ? 0.8 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Green CSV - stays in center */}
      <motion.img
        src="/images/csv-green.svg"
        alt="CSV Green"
        className="size-10 absolute"
        initial={{ scale: 1, rotate: 0, x: 0 }}
        animate={{
          x: doAnimate ? -15 : 0,
          scale: doAnimate ? 1.05 : 1,
          rotate: doAnimate ? -10 : 0,
          zIndex: 3,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Red CSV - pops out to the left with rotation */}
      <motion.img
        src="/images/csv-red.svg"
        alt="CSV Red"
        className="size-10 absolute"
        initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
        animate={{
          x: doAnimate ? -5 : 0,
          y: doAnimate ? -5 : 0,
          rotate: doAnimate ? 2 : 0,
          scale: doAnimate ? 1.05 : 1,
          zIndex: 2,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Blue CSV - pops out to the right with rotation */}
      <motion.img
        src="/images/csv-blue.svg"
        alt="CSV Blue"
        className="size-10 absolute"
        initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
        animate={{
          x: doAnimate ? 5 : 0,
          y: doAnimate ? -3 : 0,
          rotate: doAnimate ? 12 : 0,
          scale: doAnimate ? 1.05 : 1,
          zIndex: 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default AnimatedImages;
