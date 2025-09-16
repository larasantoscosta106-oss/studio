"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import type { AppState, CalculatedCommissions, CalculatedBalances, RowTotals, GrandTotals, ColumnId, Settings } from '@/lib/types';

interface AppContextType {
  appState: AppState;
  setAppState: (value: AppState | ((val: AppState) => AppState)) => void;
  updateLog: (column: ColumnId, field: 'entradas' | 'premios', value: number) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  
  commissions: CalculatedCommissions;
  balances: CalculatedBalances;
  rowTotals: RowTotals;
  grandTotals: GrandTotals;

  handleNewDay: () => void;
  handleExportJson: () => void;
  handleImportJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePrint: () => void;
  handleExportPdf: () => Promise<void>;

  printableRef: React.RefObject<HTMLDivElement>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
