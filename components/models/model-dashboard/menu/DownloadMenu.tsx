import React from "react";
import { Download } from "lucide-react";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DownloadMenuProps = {
  modelDownloadUrl?: string;
  modelTitle: string;
  status?: "pending" | "training" | "converting" | "ready" | "failed";
};

const DownloadMenu = ({
  modelDownloadUrl,
  modelTitle,
  status,
}: DownloadMenuProps) => {
  // Helper function to handle download
  const handleDownload = () => {
    if (modelDownloadUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = modelDownloadUrl;
      link.download = modelTitle || "model";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isDownloadAvailable = modelDownloadUrl && status === "ready";

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-text-primary text-sm hover:bg-bg-400 focus:bg-bg-400 data-[state=open]:bg-bg-400 tracking-tight rounded-lg !pr-4">
        Download
      </MenubarTrigger>

      <MenubarContent className="bg-bg-100 border-border-default !min-w-fit">
        {isDownloadAvailable ? (
          <MenubarItem
            className="hover:bg-[#1C1717] focus:bg-[#1C1717] cursor-pointer"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium tracking-tight">
              Download Model
            </span>
          </MenubarItem>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <MenubarItem
                className="text-text-muted cursor-not-allowed opacity-50"
                disabled
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium tracking-tight">
                  Download Model
                </span>
              </MenubarItem>
            </TooltipTrigger>
            <TooltipContent
              className="bg-bg-400"
              arrowClassName="bg-bg-400 fill-bg-400"
            >
              {status === "ready"
                ? "Download URL not available"
                : `Model is ${status || "not ready"} - download not available`}
            </TooltipContent>
          </Tooltip>
        )}
      </MenubarContent>
    </MenubarMenu>
  );
};

export default DownloadMenu;
