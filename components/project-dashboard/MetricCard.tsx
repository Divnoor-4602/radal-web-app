import React from "react";
import CustomPills from "@/components/shared/CustomPills";
import MetricCardIcon from "./MetricCardIcon";
import { EllipsisVerticalIcon, Download, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface MetricCardProps {
  icon: React.ReactElement;
  title: string;
  contentValue: string | number;
  contentDescription: string;
  pillText: string;
  pillType: "success" | "error" | "info";
  pillIcon?: React.ReactElement;
  contentValueClassName?: string;
  className?: string;
  onClick?: () => void;
  // Download functionality props
  showDownload?: boolean;
  downloadUrl?: string;
  downloadTitle?: string;
  downloadStatus?: "pending" | "training" | "converting" | "ready" | "failed";
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  contentValue,
  contentDescription,
  pillText,
  pillType,
  pillIcon,
  contentValueClassName,
  className,
  onClick,
  showDownload = false,
  downloadUrl,
  downloadTitle,
  downloadStatus,
}) => {
  // Helper function to handle download
  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadTitle || "model";
      document.body.appendChild(link);
      link.click();
      toast.success("Downloading model");
      document.body.removeChild(link);
    } else {
      toast.error("Download is not available", {
        description: `Model is ${downloadStatus || "not ready"} - download not available`,
        icon: <AlertTriangle className="w-4 h-4" />,
      });
    }
  };

  const isDownloadAvailable = downloadUrl && downloadStatus === "ready";

  return (
    <div className={`relative ${className || ""}`}>
      {/* Background div with highlight border */}
      <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
      {/* Main card with precise positioning */}
      <div
        className={`relative pt-5 pb-2 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[380px] rounded-2xl border border-border-default custom-project-card-drop-shadow px-4 to-[120%] from-[-15%] mt-[1px] ${
          onClick
            ? "cursor-pointer hover:border-border-highlight transition-colors"
            : ""
        }`}
        onClick={onClick}
      >
        {/* Card header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MetricCardIcon icon={icon} />
            <h2 className="text-lg font-medium tracking-tighter text-text-primary">
              {title}
            </h2>
          </div>
          {showDownload && (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EllipsisVerticalIcon
                    className="size-5 text-text-muted cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-bg-100 border-border-default !min-w-fit"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isDownloadAvailable ? (
                    <DropdownMenuItem
                      className="hover:bg-[#1C1717] focus:bg-[#1C1717] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                      }}
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium tracking-tight">
                        Download Model
                      </span>
                    </DropdownMenuItem>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem
                          className="text-text-muted cursor-pointer opacity-50 hover:bg-[#1C1717] focus:bg-[#1C1717]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload();
                          }}
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-medium tracking-tight">
                            Download Model
                          </span>
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent
                        className="bg-bg-400"
                        arrowClassName="bg-bg-400 fill-bg-400"
                      >
                        {downloadStatus === "ready"
                          ? "Download URL not available"
                          : `Model is ${downloadStatus || "not ready"} - download not available`}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        {/* Card content */}
        <div className="flex items-baseline justify-between mt-4">
          <div className="flex items-baseline gap-1">
            <div
              className={
                contentValueClassName ||
                "text-text-primary text-[40px] font-bold tracking-tighter"
              }
            >
              {contentValue}
            </div>
            <div className="text-text-muted text-sm font-regular tracking-tight">
              {contentDescription}
            </div>
          </div>
          <CustomPills variant={pillType} icon={pillIcon}>
            {pillText}
          </CustomPills>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
