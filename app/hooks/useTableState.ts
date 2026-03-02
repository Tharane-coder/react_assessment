"use client";

import { useCallback, useMemo, useState } from "react";
import type { TableRowData } from "../types/table";

interface RowState {
  currentValue: number;
  originalValue: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildMaps(
  rows: TableRowData[],
  parentId: string | null = null
): {
  valueMap: Map<string, RowState>;
  parentMap: Map<string, string | null>;
  childrenMap: Map<string, string[]>;
} {
  const valueMap = new Map<string, RowState>();
  const parentMap = new Map<string, string | null>();
  const childrenMap = new Map<string, string[]>();

  function visit(nodes: TableRowData[], parent: string | null) {
    for (const row of nodes) {
      parentMap.set(row.id, parent);
      const hasChildren = row.children && row.children.length > 0;
      if (hasChildren) {
        childrenMap.set(
          row.id,
          row.children!.map((c) => c.id)
        );
        visit(row.children!, row.id);
      } else {
        valueMap.set(row.id, {
          currentValue: row.value,
          originalValue: row.value,
        });
      }
    }
  }
  visit(rows, parentId);

  // Set parent values as sum of children
  function setParentValues(nodes: TableRowData[]) {
    for (const row of nodes) {
      if (row.children?.length) {
        let sum = 0;
        for (const c of row.children) {
          setParentValues([c]);
          sum += valueMap.get(c.id)!.currentValue;
        }
        valueMap.set(row.id, {
          currentValue: sum,
          originalValue: row.value,
        });
      }
    }
  }
  setParentValues(rows);
  console.log("valueMap", valueMap);
  console.log("parentMap", parentMap);
  console.log("childrenMap", childrenMap);
  return { valueMap, parentMap, childrenMap };
}

export function useTableState(initialRows: TableRowData[]) {
  console.log("initialRows", initialRows);
  const [valueMap, setValueMap] = useState<Map<string, RowState>>(() => {
    const { valueMap: vm } = buildMaps(initialRows);
    return vm;
  });

  const { parentMap, childrenMap } = useMemo(
    () => buildMaps(initialRows),
    [initialRows]
  );

  const getValue = useCallback(
    (id: string): number => {
      return valueMap.get(id)?.currentValue ?? 0;
    },
    [valueMap]
  );

  const getVariance = useCallback(
    (id: string): number => {
      const s = valueMap.get(id);
      if (!s || s.originalValue === 0) return 0;
      return round2(((s.currentValue - s.originalValue) / s.originalValue) * 100);
    },
    [valueMap]
  );

  const applyValueChangeAndRecalc = useCallback(
    (id: string, newValue: number) => {
      setValueMap((prev) => {
        const next = new Map(prev);
        const entry = next.get(id);
        if (!entry) return prev;
        const children = childrenMap.get(id);
        if (children && children.length > 0) {
          const total = children.reduce((s, cid) => s + (next.get(cid)?.currentValue ?? 0), 0);
          if (total === 0) return prev;
          const ratio = newValue / total;
          next.set(id, { ...entry, currentValue: newValue });
          for (const cid of children) {
            const c = next.get(cid);
            if (c) next.set(cid, { ...c, currentValue: round2(c.currentValue * ratio) });
          }
        } else {
          next.set(id, { ...entry, currentValue: newValue });
        }
        let currentId: string | null = id;
        while (currentId !== null) {
          const parentId: string | null = parentMap.get(currentId) ?? null;
          if (parentId === null) break;
          const siblingIds = childrenMap.get(parentId)!;
          const sum = siblingIds.reduce(
            (s, sid) => s + (next.get(sid)?.currentValue ?? 0),
            0
          );
          const parentEntry = next.get(parentId);
          if (parentEntry) next.set(parentId, { ...parentEntry, currentValue: round2(sum) });
          currentId = parentId;
        }
        return next;
      });
    },
    [childrenMap, parentMap]
  );

  const applyAllocationPct = useCallback(
    (id: string, pct: number) => {
      const entry = valueMap.get(id);
      if (!entry) return;
      const newValue = round2(entry.currentValue * (1 + pct / 100));
      applyValueChangeAndRecalc(id, newValue);
    },
    [valueMap, applyValueChangeAndRecalc]
  );

  const setAllocationVal = useCallback(
    (id: string, val: number) => {
      applyValueChangeAndRecalc(id, val);
    },
    [applyValueChangeAndRecalc]
  );

  const grandTotal = useMemo(() => {
    return initialRows.reduce((sum, row) => sum + getValue(row.id), 0);
  }, [initialRows, valueMap, getValue]);

  const originalGrandTotal = useMemo(() => {
    return initialRows.reduce((sum, row) => sum + (valueMap.get(row.id)?.originalValue ?? 0), 0);
  }, [initialRows, valueMap]);
  
  return {
    valueMap,
    getValue,
    getVariance,
    applyAllocationPct,
    setAllocationVal,
    grandTotal,
    initialRows,
  };
}
