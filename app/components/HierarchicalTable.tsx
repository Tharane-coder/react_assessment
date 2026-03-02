"use client";

import type { TableRowData } from "../types/table";
import { useTableState } from "../hooks/useTableState";
import { TableRow } from "./TableRow";
import { initialRows } from "../data/initialData";

function flattenRows(
  rows: TableRowData[],
  depth = 0
): { row: TableRowData; depth: number }[] {
  const result: { row: TableRowData; depth: number }[] = [];
  for (const row of rows) {
    result.push({ row, depth });
    if (row.children?.length) {
      result.push(...flattenRows(row.children, depth + 1));
    }
  }
  return result;
}

export function HierarchicalTable() {
  const {
    getValue,
    getVariance,
    applyAllocationPct,
    setAllocationVal,
    grandTotal,
    initialRows: rows,
  } = useTableState(initialRows);

  const flatRows = flattenRows(rows);

  return (
    <div className="table-wrap">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm" style={{ tableLayout: "fixed" }}>
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-100 font-semibold text-zinc-800">
            <th className="py-3 pl-4 pr-2">Label</th>
            <th className="py-3 px-2">Value</th>
            <th className="py-3 px-2">Input</th>
            <th className="py-3 px-2">Allocation %</th>
            <th className="py-3 px-2">Allocation Val</th>
            <th className="py-3 px-2">Variance %</th>
          </tr>
        </thead>
        <tbody>
          {flatRows.map(({ row, depth }) => (
            <TableRow
              key={row.id}
              row={row}
              depth={depth}
              value={getValue(row.id)}
              variance={getVariance(row.id)}
              onAllocationPct={applyAllocationPct}
              onAllocationVal={setAllocationVal}
            />
          ))}
          <tr className="border-t-2 border-zinc-300 bg-zinc-100 font-semibold text-zinc-900">
            <td className="py-3 pl-4 pr-2">Grand Total</td>
            <td className="py-3 px-2 tabular-nums">{grandTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
