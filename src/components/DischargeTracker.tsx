"use client";

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import AppHeader from './AppHeader';
import Toolbar from './Toolbar';
import DischargeTable from './DischargeTable';
import PeriodTotals from './PeriodTotals';
import TotalsFooter from './TotalsFooter';
import ReportsPage from './ReportsPage'; // Importado
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DischargeTracker = () => {
  const { appState, printableRef, selectedBanca, view } = useAppContext();
  
  const formattedDate = format(new Date(appState.date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className='min-h-screen flex flex-col' key={`${selectedBanca}-${view}`}>
        <AppHeader />
        <Toolbar />
        <main className="flex-grow">
          {view === 'tracker' ? (
            <div className='bg-background' ref={printableRef}>
                <div className="container mx-auto pb-4 print-only hidden">
                    <h1 className="text-2xl font-bold text-center py-4">ROTEIRO DESCARGA – {appState.settings.bancaName.toUpperCase()}</h1>
                    <h2 className="text-xl font-semibold text-center pb-4">Data: {formattedDate}</h2>
                </div>
                <DischargeTable />
                <PeriodTotals />
                <TotalsFooter />
            </div>
          ) : (
            <ReportsPage />
          )}
        </main>
      </div>
  );
};


export default DischargeTracker;
