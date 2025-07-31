import React from "react";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Id } from "@/convex/_generated/dataModel";
import DatasetItem from "./DatasetItem";

type DatasetsMenuProps = {
  datasetIds?: Id<"datasets">[];
  truncateText: (text: string, maxLength?: number) => string;
};

const DatasetsMenu = ({ datasetIds, truncateText }: DatasetsMenuProps) => {
  return (
    <MenubarMenu>
      <MenubarTrigger className="text-text-primary text-sm hover:bg-bg-400 focus:bg-bg-400 data-[state=open]:bg-bg-400 tracking-tight rounded-lg">
        Datasets
      </MenubarTrigger>
      <MenubarContent className="bg-bg-100 border-border-default">
        {datasetIds && datasetIds.length > 0 ? (
          <div className="p-2 space-y-2 max-w-[380px]">
            <div className="text-xs text-text-muted mb-2">
              Linked Datasets ({datasetIds.length})
            </div>
            {datasetIds.map((datasetId) => (
              <DatasetItem
                key={datasetId}
                datasetId={datasetId}
                truncateText={truncateText}
              />
            ))}
          </div>
        ) : (
          <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717] text-text-muted">
            No datasets linked
          </MenubarItem>
        )}
      </MenubarContent>
    </MenubarMenu>
  );
};

export default DatasetsMenu;
