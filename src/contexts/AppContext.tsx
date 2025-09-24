"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import type { AppState, MultiBancaState, BancaId, CalculatedCommissions, CalculatedBalances, RowTotals, GrandTotals, ColumnId, Settings, Period, SavedDay } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { PERIODS, COLUMNS } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  handleSaveDay: () => void;
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
  const initialLogValue = { manha: 0, tarde: 0, noite: 0, grupoManha: 0, grupoTarde: 0, grupoNoite: 0 };
  
  return {
    date: new Date().toISOString().split('T')[0],
    log: {
      entradas: { ...initialLogValue },
      premios: { ...initialLogValue },
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
    },
    savedDays: {
        realCariri: [],
        bancaUniao: [],
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
  
  const handleSaveDay = () => {
    const dayToSave: SavedDay = {
        ...appState,
        id: appState.date,
        totals: rowTotals,
    };
    
    setMultiAppState(prev => {
        const existingDays = prev.savedDays?.[selectedBanca] ?? [];
        const dayIndex = existingDays.findIndex(d => d.id === dayToSave.id);

        let newSavedDays;
        if (dayIndex > -1) {
            // Update existing day
            newSavedDays = [...existingDays];
            newSavedDays[dayIndex] = dayToSave;
        } else {
            // Add new day
            newSavedDays = [...existingDays, dayToSave];
        }

        return {
            ...prev,
            savedDays: {
                ...prev.savedDays,
                [selectedBanca]: newSavedDays,
            },
        };
    });

    toast({ title: "Dia Salvo!", description: `O registro para ${format(new Date(appState.date + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })} foi salvo com sucesso.` });
  };

  const handlePrint = () => {
      window.print();
  };

  const handleExportPdf = async () => {
    const element = printableRef.current;
    if (!element) return;
    toast({ title: "Gerando PDF...", description: "Por favor, aguarde." });

    const mobileTable = element.querySelector<HTMLElement>('.mobile-table-view');
    const desktopTable = element.querySelector<HTMLElement>('.desktop-table-view');

    // Store original display styles
    const mobileOriginalDisplay = mobileTable ? getComputedStyle(mobileTable).display : '';
    const desktopOriginalDisplay = desktopTable ? getComputedStyle(desktopTable).display : '';

    // Force desktop view for capture
    if (mobileTable) mobileTable.style.display = 'none';
    if (desktopTable) desktopTable.style.display = 'block';

    try {
        document.body.classList.add('print-capture');

        const canvas = await html2canvas(element, { 
            scale: 2.5,
            useCORS: true,
            logging: false,
            width: element.scrollWidth,
            height: element.scrollHeight,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });
        
        document.body.classList.remove('print-capture');
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const usableWidth = pdfWidth - (2 * margin);
        const usableHeight = pdfHeight - (2 * margin);
        const ratio = Math.min(usableWidth / canvas.width, usableHeight / canvas.height);
        const finalImgWidth = canvas.width * ratio;
        const finalImgHeight = canvas.height * ratio;
        const imgX = (pdfWidth - finalImgWidth) / 2;
        const imgY = (pdfHeight - finalImgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, finalImgWidth, finalImgHeight);
        
        const now = new Date();
        const dateTimeString = format(now, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`Exportado em: ${dateTimeString}`, margin, pdfHeight - margin + 5);

        pdf.save(`descarrego_${appState.settings.bancaName.replace(/ /g, '_')}_${appState.date}.pdf`);

        toast({ title: "PDF Gerado!", description: "Seu PDF foi exportado com sucesso." });
    } catch(e: any) {
        console.error(e);
        toast({ variant: "destructive", title: "Erro ao gerar PDF", description: e.message || "Ocorreu um erro inesperado." });
    } finally {
        // Restore original display styles
        if (mobileTable) mobileTable.style.display = mobileOriginalDisplay;
        if (desktopTable) desktopTable.style.display = desktopOriginalDisplay;
        document.body.classList.remove('print-capture');
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
    handleSaveDay,
    handlePrint,
    handleExportPdf,
    printableRef,
  };
  
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
