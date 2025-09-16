"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import type { AppState, MultiBancaState, BancaId, CalculatedCommissions, CalculatedBalances, RowTotals, GrandTotals, ColumnId, Settings, Period } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { PERIODS, COLUMNS } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const { toast } = useToast();
  const printableRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedBanca = multiAppState.selectedBanca;
  const appState = multiAppState.bancas[selectedBanca];

  useEffect(() => {
      if (isClient) {
        const theme = selectedBanca === 'bancaUniao' ? 'banca-uniao' : 'default';
        document.documentElement.setAttribute('data-theme', theme);
      }
  }, [selectedBanca, isClient]);

  const setSelectedBanca = (bancaId: BancaId) => {
    setMultiAppState(prev => ({ ...prev, selectedBanca: bancaId }));
  };

  const updateBancaState = (updater: (prevState: AppState) => AppState) => {
      setMultiAppState(prev => ({
          ...prev,
          bancas: {
              ...prev.bancas,
              [selectedBanca]: updater(prev.bancas[selectedBanca])
          }
      }));
  };

  const updateLog = (column: ColumnId, field: 'entradas' | 'premios', value: number) => {
      updateBancaState(prev => ({
          ...prev,
          log: {
              ...prev.log,
              [field]: {
                  ...prev.log[field],
                  [column]: value
              }
          }
      }));
  };

  const updateSettings = (newSettings: Partial<Settings & { date?: string }>) => {
      updateBancaState(prev => {
          const updatedState = { ...prev };
          if (newSettings.date) {
              updatedState.date = newSettings.date;
              delete newSettings.date;
          }
          updatedState.settings = { ...prev.settings, ...newSettings };
          return updatedState;
      });
  };

  const { commissions, balances, rowTotals, grandTotals } = useMemo(() => {
      const { log, settings } = appState;
      
      const commissions = Object.fromEntries(
          COLUMNS.map(col => {
              const rate = PERIODS.includes(col as Period) ? settings.commissionPeriod / 100 : settings.commissionGroup / 100;
              const commission = log.entradas[col] * rate;
              return [col, Math.round(commission * 100) / 100];
          })
      ) as Record<ColumnId, number>;

      const balances = Object.fromEntries(
          COLUMNS.map(col => [col, log.entradas[col] - commissions[col] - log.premios[col]])
      ) as Record<ColumnId, number>;
      
      const sum = (obj: Record<string, number>) => Object.values(obj).reduce((a, b) => a + b, 0);

      const rowTotals = {
          entradas: sum(log.entradas),
          comissao: sum(commissions),
          premios: sum(log.premios),
          saldoFinal: sum(balances),
      };
      
      return { commissions, balances, rowTotals, grandTotals: rowTotals };
  }, [appState]);

  const handleNewDay = () => {
      const initialBancaState = getInitialBancaState(selectedBanca);
      updateBancaState(prev => ({
          ...initialBancaState,
          settings: prev.settings, // Keep settings
      }));
      toast({ title: "Novo Dia", description: `Os dados para ${appState.settings.bancaName} foram reiniciados.` });
  };

  const handlePrint = () => {
      window.print();
  };

  const handleExportPdf = async () => {
      if (!printableRef.current) return;
      toast({ title: "Gerando PDF...", description: "Por favor, aguarde." });

      try {
          const canvas = await html2canvas(printableRef.current, { scale: 2, useCORS: true, backgroundColor: null });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 10;
          
          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
          pdf.save(`descarrego_${appState.settings.bancaName.replace(' ','_')}_${appState.date}.pdf`);
          toast({ title: "PDF Gerado!", description: "Seu PDF foi exportado com sucesso." });
      } catch(e) {
          toast({ variant: "destructive", title: "Erro ao gerar PDF", description: "Ocorreu um erro inesperado." });
      }
  };

  const contextValue: AppContextType = {
    multiAppState,
    setMultiAppState,
    selectedBanca,
    setSelectedBanca,
    appState,
    updateLog,
    updateSettings,
    getInitialBancaState,
    commissions,
    balances,
    rowTotals,
    grandTotals,
    handleNewDay,
    handlePrint,
    handleExportPdf,
    printableRef,
  };
  
  // Prevent rendering on server to avoid hydration mismatch with localStorage
  if (!isClient) {
      return (
          <AppContext.Provider value={contextValue}>
              <div className="min-h-screen bg-background"></div>
          </AppContext.Provider>
      )
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
