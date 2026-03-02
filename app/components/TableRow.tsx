"use client";

import { useState } from "react";
import type { TableRowData } from "../types/table";

interface TableRowProps {
  row: TableRowData;
  depth: number;
  value: number;
  variance: number;
  onAllocationPct: (id: string, pct: number) => void;
  onAllocationVal: (id: string, val: number) => void;
}

export function TableRow({
  row,
  depth,
  value,
  variance,
  onAllocationPct,
  onAllocationVal,
}: TableRowProps) {
  const [input, setInput] = useState("");
  const [showNumbersOnlyHint, setShowNumbersOnlyHint] = useState(false);

  const handleAllocationPct = () => {
    const parsed = parseFloat(input.replace("%", "").trim());
    if (!Number.isNaN(parsed)) {
      onAllocationPct(row.id, parsed);
      setInput("");
    }
  };

  const handleAllocationVal = () => {
    const parsed = parseFloat(input.replace(/,/g, "").trim());
    if (!Number.isNaN(parsed)) {
      onAllocationVal(row.id, parsed);
      setInput("");
    }
  };

  const labelDisplay = depth > 0 ? `${"--".repeat(depth)} ${row.label}` : row.label;

  return (
    <>
      <tr className="border-b border-zinc-200 hover:bg-zinc-50/80">
        <td className="py-2.5 pl-4 pr-2 font-medium text-zinc-800" style={{ paddingLeft: `${12 + depth * 20}px` }}>
          {labelDisplay}
        </td>
        <td className="py-2.5 px-2 tabular-nums text-zinc-700">{value.toFixed(2)}</td>
        <td className="py-2.5 px-2">
          <div className="block">
            <input
              type="text"
              inputMode="decimal"
              value={input}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*\.?\d*$/.test(v)) {
                  setInput(v);
                  setShowNumbersOnlyHint(false);
                } else {
                  setShowNumbersOnlyHint(true);
                }
              }}
              className="w-28 rounded border border-zinc-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label={`Input for ${row.label}. Numbers only.`}
            />
            {showNumbersOnlyHint && (
              <span className="mt-0.5 block text-xs text-red-600">Numbers only allowed</span>
            )}
          </div>
        </td>
        <td className="py-2.5 px-2">
          <button
            type="button"
            onClick={handleAllocationPct}
            className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
          >
            Allocation %
          </button>
        </td>
        <td className="py-2.5 px-2">
          <button
            type="button"
            onClick={handleAllocationVal}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Allocation Val
          </button>
        </td>
        <td className="py-2.5 px-2 tabular-nums text-zinc-600">
          {variance >= 0 ? "+" : ""}{variance.toFixed(2)}%
        </td>
      </tr>
    </>
  );
}
