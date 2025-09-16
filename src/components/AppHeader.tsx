"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BancaId } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


const AppHeader = () => {
    const { appState, updateSettings, selectedBanca, setSelectedBanca } = useAppContext();
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        if (newDate) {
            updateSettings({ ...appState.settings, date: newDate });
        }
    }
    
    const formattedDateForInput = appState.date;
    const formattedDateForDisplay = format(new Date(appState.date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    return (
        <header className="bg-primary text-primary-foreground p-4 shadow-md no-print sticky top-0 z-50">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col items-center sm:items-start gap-2">
                    <h1 className="text-2xl font-bold text-center sm:text-left">
                        ROTEIRO DESCARGA – {appState.settings.bancaName.toUpperCase()}
                    </h1>
                     <Tabs value={selectedBanca} onValueChange={(value) => setSelectedBanca(value as BancaId)} className="w-auto">
                        <TabsList className="bg-primary/20 border border-primary-foreground/20 text-primary-foreground">
                            <TabsTrigger value="realCariri">Real Cariri</TabsTrigger>
                            <TabsTrigger value="bancaUniao">Banca União</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="flex flex-col items-center sm:items-end gap-2">
                    <p className="font-semibold text-lg hidden sm:block">{formattedDateForDisplay}</p>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="date-input" className="font-semibold sm:hidden">Data:</Label>
                        <Input 
                            id="date-input"
                            type="date" 
                            value={formattedDateForInput}
                            onChange={handleDateChange}
                            className="w-auto bg-primary-foreground/20 text-primary-foreground border-primary-foreground/50"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
