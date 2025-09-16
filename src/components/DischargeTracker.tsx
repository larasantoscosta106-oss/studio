"use client";

import React, { useRef, useMemo } from 'react';
import { AppState, ColumnId, PERIODS, COLUMNS, Settings } from '@/lib/types';
import { AppContext, useAppContext } from '@/contexts/AppContext';
import AppHeader from './AppHeader';
import Toolbar from './Toolbar';
import DischargeTable from './DischargeTable';
import TotalsFooter from './TotalsFooter';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DischargeTracker = () => {
  const { 
    appState, 
    updateLog, 
    handleNewDay, 
    handleExportJson, 
    handleImportJson, 
    handleExportPdf, 
    printableRef 
  } = useActiveBanca();

  return (
    <div className='printable-area' ref={printableRef}>
        <div className="container mx-auto pb-4 print-only hidden">
            <h1 className="text-2xl font-bold text-center py-4">ROTEIRO DESCARGA – {appState.settings.bancaName.toUpperCase()} | Data: {new Date(appState.date + 'T00:00:00').toLocaleDateString('pt-BR')}</h1>
        </div>
        <DischargeTable />
        <TotalsFooter />
    </div>
  );
};

const useActiveBanca = () => {
    const { selectedBanca, multiAppState, setMultiAppState, getInitialBancaState } = useAppContext();
    const { toast } = useToast();
    const printableRef = useRef<HTMLDivElement>(null);

    const appState = multiAppState.bancas[selectedBanca];

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
                const rate = PERIODS.includes(col as any) ? settings.commissionPeriod / 100 : settings.commissionGroup / 100;
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

    const handleExportJson = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(appState))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `descarrego_${appState.settings.bancaName.replace(' ','_')}_${appState.date}.json`;
        link.click();
        toast({ title: "JSON Exportado", description: "Os dados foram exportados com sucesso." });
    };

    const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const importedState = JSON.parse(text);
                        if (importedState.log && importedState.settings) {
                            updateBancaState(() => importedState);
                            toast({ title: "JSON Importado", description: "Dados importados com sucesso." });
                        } else {
                            throw new Error("Formato de arquivo inválido.");
                        }
                    }
                } catch (error) {
                    toast({ variant: "destructive", title: "Erro na Importação", description: (error as Error).message });
                } finally {
                    event.target.value = '';
                }
            };
            reader.readAsText(file);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPdf = async () => {
        if (!printableRef.current) return;
        toast({ title: "Gerando PDF...", description: "Por favor, aguarde." });

        try {
            const canvas = await html2canvas(printableRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;
            
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`descarrego_${appState.settings.bancaName.replace(' ','_')}_${appState.date}.pdf`);
            toast({ title: "PDF Gerado!", description: "Seu PDF foi exportado com sucesso." });
        } catch(e) {
            toast({ variant: "destructive", title: "Erro ao gerar PDF", description: "Ocorreu um erro inesperado." });
        }
    };
    
    return {
        appState,
        updateLog,
        updateSettings,
        commissions,
        balances,
        rowTotals,
        grandTotals,
        handleNewDay,
        handleExportJson,
        handleImportJson,
        handlePrint,
        handleExportPdf,
        printableRef
    };
}


const AppWrapper = () => {
    const { selectedBanca } = useAppContext();

    // The key forces a re-mount of the entire tracker when the banca changes
    // This ensures all hooks and contexts are reset correctly for the selected banca
    return (
      <>
        <AppHeader />
        <Toolbar />
        <DischargeTracker key={selectedBanca} />
      </>
    );
};

export default AppWrapper;
