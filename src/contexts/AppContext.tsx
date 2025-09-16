"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { AppState, MultiBancaState, BancaId, CalculatedCommissions, CalculatedBalances, RowTotals, GrandTotals, ColumnId, Settings } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';

interface AppContextType {
  multiAppState: MultiBancaState;
  setMultiAppState: (value: MultiBancaState | ((val: MultiBancaState) => MultiBancaState)) => void;
  selectedBanca: BancaId;
  setSelectedBanca: (bancaId: BancaId) => void;
  appState: AppState;
  updateLog: (column: ColumnId, field: 'entradas' | 'premios', value: number) => void;
  updateSettings: (newSettings: Partial<Settings & { date?: string }>) => void;
  getInitialBancaState: (bancaId: BancaId) => AppState;

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

const getInitialBancaState = (bancaId: BancaId): AppState => {
  const isRealCariri = bancaId === 'realCariri';
  return {
    date: new Date().toISOString().split('T')[0],
    log: {
      entradas: { manha: 100, tarde: 150, noite: 80, grupoManha: 50, grupoTarde: 60, grupoNoite: 70 },
      premios: { manha: 10, tarde: 0, noite: 5, grupoManha: 0, grupoTarde: 15, grupoNoite: 0 },
    },
    settings: {
      bancaName: isRealCariri ? "Real Cariri" : "Banca União",
      commissionPeriod: 40,
      commissionGroup: 30,
    },
  };
};

const getInitialMultiBancaState = (): MultiBancaState => {
  return {
    selectedBanca: 'realCariri',
    bancas: {
      realCariri: getInitialBancaState('realCariri'),
      bancaUniao: getInitialBancaState('bancaUniao'),
    }
  };
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [multiAppState, setMultiAppState] = useLocalStorage<MultiBancaState>('multi-discharge-app-state', getInitialMultiBancaState());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedBanca = multiAppState.selectedBanca;
  const appState = multiAppState.bancas[selectedBanca];

  useEffect(() => {
      const theme = selectedBanca === 'bancaUniao' ? 'banca-uniao' : 'default';
      document.documentElement.setAttribute('data-theme', theme);
  }, [selectedBanca]);

  const setSelectedBanca = (bancaId: BancaId) => {
    setMultiAppState(prev => ({ ...prev, selectedBanca: bancaId }));
  };

  // This context now acts as a dummy provider for structure,
  // since the actual logic is handled within DischargeTracker.
  // This is a simplification to avoid prop-drilling hell while ensuring reactivity.
  const dummyContext: AppContextType = {
    multiAppState,
    setMultiAppState,
    selectedBanca,
    setSelectedBanca,
    getInitialBancaState,
    appState, // current banca state
    // The rest are placeholder functions/values as they are implemented in the `useActiveBanca` hook.
    // This avoids errors but the real implementation is scoped to the active banca.
    updateLog: () => {},
    updateSettings: () => {},
    commissions: {} as CalculatedCommissions,
    balances: {} as CalculatedBalances,
    rowTotals: {} as RowTotals,
    grandTotals: {} as GrandTotals,
    handleNewDay: () => {},
    handleExportJson: () => {},
    handleImportJson: () => {},
    handlePrint: () => {},
    handleExportPdf: async () => {},
    printableRef: React.createRef<HTMLDivElement>(),
  };

  // Prevent rendering on server to avoid hydration mismatch with localStorage
  if (!isClient) {
      return null;
  }

  return (
    <AppContext.Provider value={dummyContext}>
      {children}
    </AppContext.Provider>
  );
};
