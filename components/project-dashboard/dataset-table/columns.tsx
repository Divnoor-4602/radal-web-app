"use client";

import { ColumnDef } from "@tanstack/react-table";
import { File, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatasetTableRow } from "@/lib/validations/dataset.schema";
import { DatasetActions } from "./actions";

// Export the type for backward compatibility
export type Dataset = DatasetTableRow;

export const columns: ColumnDef<DatasetTableRow>[] = [
  {
    accessorKey: "dataset",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          <div className="text-sm font-medium tracking-tight text-text-inactive">
            Dataset
          </div>
          <ArrowUpDown className="size-4 text-text-inactive" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dataset = row.getValue("dataset") as string;
      return (
        <div className="flex items-center gap-2">
          <File className="size-5 text-text-muted" />
          <span className=" text-base text-text-muted">{dataset}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "size",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          <div className="text-sm font-medium tracking-tight text-text-inactive">
            Size
          </div>
          <ArrowUpDown className="size-4 text-text-inactive" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const size = row.getValue("size") as string;
      return (
        <div className="rounded-full flex items-center border px-3 py-1 text-[12px] font-medium bg-info border-info-border text-info-foreground w-fit">
          {size}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          <div className="text-sm font-medium tracking-tight text-text-inactive">
            Date
          </div>
          <ArrowUpDown className="size-4 text-text-inactive" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return <div className="text-base text-text-muted">{date}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const dataset = row.original;
      return <DatasetActions datasetId={dataset.id} />;
    },
  },
];
