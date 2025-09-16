"use client";

import React, { useRef, useMemo } from 'react';
import { AppContext, useAppContext } from '@/contexts/AppContext';
import AppHeader from './AppHeader';
import Toolbar from './Toolbar';
import DischargeTable from './DischargeTable';
import TotalsFooter from './TotalsFooter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DischargeTracker = () => {
  const { appState, printableRef } = useAppContext();
  
  const formattedDate = format(new Date(appState.date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className='printable-area bg-background' ref={printableRef}>
        <div className="container mx-auto pb-4 print-only hidden">
            <h1 className="text-2xl font-bold text-center py-4">ROTEIRO DESCARGA – {appState.settings.bancaName.toUpperCase()}</h1>
            <h2 className="text-xl font-semibold text-center pb-4">Data: {formattedDate}</h2>
        </div>
        <DischargeTable />
        <TotalsFooter />
    </div>
  );
};

const AppWrapper = () => {
    const { selectedBanca } = useAppContext();

    // The key forces a re-mount of the entire tracker when the banca changes
    // This ensures all hooks and contexts are reset correctly for the selected banca
    return (
      <div className='min-h-screen flex flex-col'>
        <AppHeader />
        <Toolbar />
        <main className="flex-grow">
          <DischargeTracker key={selectedBanca} />
        </main>
      </div>
    );
};

export default AppWrapper;
