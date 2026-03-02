export interface TableRowData {
  id: string;
  label: string;
  value: number;
  children?: TableRowData[];
}

export interface FlatRowState {
  currentValue: number;
  originalValue: number;
}

export type RowId = string;
