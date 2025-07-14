import React from "react";
import { GripVertical } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface PreviewNodeProps {
  icon: LucideIcon;
  title: string;

  nodeType: string;
  className?: string;
}

export const PreviewNode: React.FC<PreviewNodeProps> = ({
  icon: Icon,
  title,

  nodeType,
  className = "",
}) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`pt-4 pb-5 bg-gradient-to-t from-bg-100 to-bg-400 w-full rounded-2xl border border-border-default custom-project-card-drop-shadow px-5 to-[110%] from-[-15%] cursor-grab active:cursor-grabbing ${className}`}
    >
      {/* card header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className="size-5 text-text-primary" />
          <div className="text-text-primary text-base font-medium tracking-tighter">
            {title}
          </div>
        </div>
        {/* Drag handle */}
        <GripVertical className="size-5 text-text-inactive" />
      </div>
    </div>
  );
};

export default PreviewNode;
