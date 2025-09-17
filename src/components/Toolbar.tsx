"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Printer,
  PlusCircle,
  Settings,
  FileText
} from "lucide-react";
import SettingsDialog from './SettingsDialog';
import { useAppContext } from '@/contexts/AppContext';

const Toolbar = () => {
  const { handleNewDay, handlePrint, handleExportPdf } = useAppContext();
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-4 flex justify-center sm:justify-start no-print">
      <div className="w-full sm:w-auto">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Button onClick={handleNewDay} variant="outline" size="sm"><PlusCircle /> Novo Dia</Button>
            <Button onClick={() => setSettingsOpen(true)} variant="outline" size="sm"><Settings /> Configurações</Button>
            <Button onClick={handlePrint} variant="outline" size="sm"><Printer /> Imprimir</Button>
            <Button onClick={handleExportPdf} variant="outline" size="sm"><FileText /> Exportar PDF</Button>
        </div>
      </div>
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Toolbar;

    