"use client";

import { ColumnDef } from "@tanstack/react-table";
import { File, Folder, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatasetTableRow } from "@/lib/validations/dataset.schema";

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
    accessorKey: "model",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          <div className="text-sm font-medium tracking-tight text-text-inactive">
            Models
          </div>
          <ArrowUpDown className="size-4 text-text-inactive" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const model = row.getValue("model") as string;
      return (
        <div className="flex items-center gap-2">
          <Folder className="size-5 text-text-muted" />
          <span className="text-text-muted text-base">{model}</span>
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

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(dataset.id)}
            >
              Copy dataset ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View dataset</DropdownMenuItem>
            <DropdownMenuItem>Download dataset</DropdownMenuItem>
            <DropdownMenuItem>Delete dataset</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
