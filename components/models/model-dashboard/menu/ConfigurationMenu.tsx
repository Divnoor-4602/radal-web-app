import React from "react";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import CustomPills from "@/components/shared/CustomPills";

type TrainingConfig = {
  epochs: number;
  batch_size: number;
  train_quant: "int4" | "int8";
  download_quant: "int4" | "int8";
};

type ConfigurationMenuProps = {
  trainingConfig?: TrainingConfig;
};

const ConfigurationMenu = ({ trainingConfig }: ConfigurationMenuProps) => {
  return (
    <MenubarMenu>
      <MenubarTrigger className="text-text-primary text-sm hover:bg-bg-400 focus:bg-bg-400 data-[state=open]:bg-bg-400 tracking-tight rounded-lg !pl-3">
        Configuration
      </MenubarTrigger>
      <MenubarContent className="bg-bg-100 border-border-default">
        {trainingConfig ? (
          <div className="p-2 space-y-3">
            <div className="text-xs text-text-muted mb-3">
              Training Configuration
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Epochs</span>
              <CustomPills
                variant="neutral"
                size="sm"
                className="tracking-tighter py-[1px] px-2 text-xs"
              >
                {trainingConfig.epochs}
              </CustomPills>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Batch Size</span>
              <CustomPills
                variant="neutral"
                size="sm"
                className="tracking-tighter py-[1px] px-2 text-xs"
              >
                {trainingConfig.batch_size}
              </CustomPills>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Train Quant</span>
              <CustomPills
                variant="neutral"
                size="sm"
                className="tracking-tighter py-[1px] px-2 text-xs"
              >
                {trainingConfig.train_quant}
              </CustomPills>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Download Quant</span>
              <CustomPills
                variant="neutral"
                size="sm"
                className="tracking-tighter py-[1px] px-2 text-xs"
              >
                {trainingConfig.download_quant}
              </CustomPills>
            </div>
          </div>
        ) : (
          <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717] text-text-muted">
            No configuration available
          </MenubarItem>
        )}
      </MenubarContent>
    </MenubarMenu>
  );
};

export default ConfigurationMenu;
