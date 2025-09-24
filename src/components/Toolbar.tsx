"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Printer,
  PlusCircle,
  Settings,
  FileText,
  Save,
  BookOpen
} from "lucide-react";
import SettingsDialog from './SettingsDialog';
import { useAppContext } from '@/contexts/AppContext';

const Toolbar = () => {
  const { handleNewDay, handleSaveDay, handlePrint, handleExportPdf, view, setView } = useAppContext();
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 no-print">
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {view === 'tracker' ? (
          <>
            <Button onClick={handleNewDay} variant="outline" size="sm"><PlusCircle /> Novo Dia</Button>
            <Button onClick={handleSaveDay} variant="outline" size="sm"><Save /> Salvar Dia</Button>
            <Button onClick={() => setSettingsOpen(true)} variant="outline" size="sm"><Settings /> Configurações</Button>
            <Button onClick={handlePrint} variant="outline" size="sm"><Printer /> Imprimir</Button>
            <Button onClick={handleExportPdf} variant="outline" size="sm"><FileText /> Exportar PDF</Button>
          </>
        ) : (
           <Button onClick={() => setView('tracker')} variant="outline" size="sm">Voltar ao Lançamento</Button>
        )}
      </div>
       <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
         {view === 'tracker' && (
            <Button onClick={() => setView('reports')} variant="default" size="sm"><BookOpen /> Ver Relatórios</Button>
         )}
      </div>
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Toolbar;
