"use client";

import React, { FC } from "react";
import { motion } from "motion/react";

interface AnimatedImagesProps {
  isHovered: boolean;
}

export const AnimatedImages: FC<AnimatedImagesProps> = ({ isHovered }) => {
  return (
    <motion.div className="w-16 h-16 relative flex items-center justify-center">
      {/* Green CSV - stays in center */}
      <motion.img
        src="/images/csv-green.svg"
        alt="CSV Green"
        className="size-10 absolute"
        initial={{ scale: 1, rotate: 0, x: 0 }}
        animate={{
          x: isHovered ? -15 : 0,
          scale: isHovered ? 1.05 : 1,
          rotate: isHovered ? -10 : 0,
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
          x: isHovered ? -5 : 0,
          y: isHovered ? -5 : 0,
          rotate: isHovered ? 2 : 0,
          scale: isHovered ? 1.05 : 1,
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
          x: isHovered ? 5 : 0,
          y: isHovered ? -3 : 0,
          rotate: isHovered ? 12 : 0,
          scale: isHovered ? 1.05 : 1,
          zIndex: 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default AnimatedImages;
