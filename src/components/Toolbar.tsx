"use client";

import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  FileDown,
  FileUp,
  Printer,
  PlusCircle,
  Settings,
  Save,
  FileText
} from "lucide-react";
import SettingsDialog from './SettingsDialog';
import { useAppContext } from '@/contexts/AppContext';

const Toolbar = () => {
  const { handleNewDay, handleExportJson, handleImportJson, handlePrint, handleExportPdf } = useAppContext();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const onImportClick = () => {
    importFileRef.current?.click();
  };

  return (
    <div className="container mx-auto p-4 flex flex-wrap gap-2 justify-center sm:justify-start no-print">
      <Button onClick={handleNewDay}><PlusCircle /> Novo Dia</Button>
      <Button onClick={() => setSettingsOpen(true)}><Settings /> Configurações</Button>
      <Button onClick={onImportClick}><FileUp /> Importar JSON</Button>
      <Button onClick={handleExportJson}><FileDown /> Exportar JSON</Button>
      <Button onClick={handlePrint}><Printer /> Imprimir</Button>
      <Button onClick={handleExportPdf}><FileText /> Exportar PDF</Button>
      <input type="file" ref={importFileRef} onChange={handleImportJson} accept=".json" className="hidden" />
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Toolbar;
