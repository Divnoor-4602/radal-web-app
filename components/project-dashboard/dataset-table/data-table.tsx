"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  modelFilter?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  modelFilter,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [pageSize, setPageSize] = React.useState(10);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);

  // Update column filters when modelFilter prop changes
  React.useEffect(() => {
    if (modelFilter !== undefined) {
      setColumnFilters([{ id: "model", value: modelFilter }]);
    }
  }, [modelFilter]);

  // Calculate optimal page size based on container height
  React.useEffect(() => {
    const calculatePageSize = () => {
      if (!containerRef.current || !tableRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const tableHeaderHeight =
        tableRef.current.querySelector("thead")?.clientHeight || 0;
      const paginationHeight = 60; // Approximate height of pagination controls
      const rowSpacing = 16; // 4 * 4px (border-spacing-y-4)

      // Calculate available height for table rows
      const availableHeight =
        containerHeight - tableHeaderHeight - paginationHeight - 32; // 32px for spacing

      // Estimate row height (including spacing and padding)
      const estimatedRowHeight = 64 + rowSpacing; // Approximate row height with spacing

      // Calculate how many rows can fit
      const calculatedPageSize = Math.max(
        1,
        Math.floor(availableHeight / estimatedRowHeight),
      );

      // Set minimum of 5 and maximum of 50 rows per page
      const optimalPageSize = Math.min(50, Math.max(6, calculatedPageSize));

      if (optimalPageSize !== pageSize) {
        setPageSize(optimalPageSize);
      }
    };

    // Initial calculation
    calculatePageSize();

    // Recalculate on window resize
    const handleResize = () => {
      setTimeout(calculatePageSize, 100); // Debounce resize events
    };

    window.addEventListener("resize", handleResize);

    // Use ResizeObserver for more accurate container size changes
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(calculatePageSize, 100);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [pageSize]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  // Update table page size when pageSize state changes
  React.useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      {/* Table */}
      <div className="flex-1 min-h-0">
        <Table
          ref={tableRef}
          className="border-separate border-spacing-y-4 border-spacing-x-0"
        >
          <TableHeader className="border-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b-0"
                style={{ borderBottomWidth: 0 }}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`border-0 bg-[#221C1C] hover:bg-[#221C1C]/90 px-2 py-3 custom-table-row-inner-shadow rounded-xl ${index === 0 ? "pt-20" : ""}`}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell
                      key={cell.id}
                      className={`bg-transparent ${cellIndex === 0 ? "rounded-l-xl" : ""} ${cellIndex === row.getVisibleCells().length - 1 ? "rounded-r-xl" : ""}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between pt-4 flex-shrink-0">
          <div className="text-sm text-text-muted">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
            -
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} rows total.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-[#1C1717] border border-border-default hover:bg-[#221C1C] text-text-inactive text-xs"
            >
              <ChevronLeft className="size-3" />
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-[#1C1717] border border-border-default hover:bg-[#221C1C] text-text-inactive text-xs"
            >
              Next
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
