"use client";

import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileDown,
  FileUp,
  Printer,
  PlusCircle,
  Settings,
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
    <div className="container mx-auto px-4 pt-4 flex justify-center sm:justify-start no-print">
      <Tabs defaultValue="actions" className="w-full sm:w-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
        </TabsList>
        <TabsContent value="actions">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
            <Button onClick={handleNewDay}><PlusCircle /> Novo Dia</Button>
            <Button onClick={() => setSettingsOpen(true)}><Settings /> Configurações</Button>
            <Button onClick={onImportClick}><FileUp /> Importar JSON</Button>
          </div>
        </TabsContent>
        <TabsContent value="export">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
            <Button onClick={handleExportJson}><FileDown /> Exportar JSON</Button>
            <Button onClick={handlePrint}><Printer /> Imprimir</Button>
            <Button onClick={handleExportPdf}><FileText /> Exportar PDF</Button>
          </div>
        </TabsContent>
      </Tabs>
      <input type="file" ref={importFileRef} onChange={handleImportJson} accept=".json" className="hidden" />
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Toolbar;
