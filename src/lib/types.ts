export const PERIODS = ['manha', 'tarde', 'noite'] as const;
export const GROUPS = ['grupoManha', 'grupoTarde', 'grupoNoite'] as const;
export const COLUMNS = [...PERIODS, ...GROUPS] as const;

export type Period = typeof PERIODS[number];
export type Group = typeof GROUPS[number];
export type ColumnId = Period | Group;

export type BancaId = 'realCariri' | 'bancaUniao';

export interface LogData {
  entradas: Record<ColumnId, number>;
  premios: Record<ColumnId, number>;
}

export interface Settings {
  bancaName: string;
  commissionPeriod: number; // Stored as percentage, e.g. 40
  commissionGroup: number; // Stored as percentage, e.g. 30
}

export interface AppState {
  date: string;
  log: LogData;
  settings: Settings;
}

export interface SavedDay extends AppState {
    id: string; // Typically date string
    totals: RowTotals;
}

export interface MultiBancaState {
    selectedBanca: BancaId;
    bancas: Record<BancaId, AppState>;
    savedDays: Record<BancaId, SavedDay[]>;
}

export type CalculatedCommissions = Record<ColumnId, number>;
export type CalculatedBalances = Record<ColumnId, number>;
export type RowTotals = {
    entradas: number;
    comissao: number;
    premios: number;
    saldoFinal: number;
}
export type GrandTotals = {
    entradas: number;
    comissao: number;
    premios: number;
    saldoFinal: number;
}
