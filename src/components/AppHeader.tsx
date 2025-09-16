"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BancaId } from "@/lib/types";

const AppHeader = () => {
    const { appState, updateSettings, selectedBanca, setSelectedBanca } = useAppContext();
    
    return (
        <header className="bg-primary text-primary-foreground p-4 shadow-md no-print">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col items-center sm:items-start gap-2">
                    <h1 className="text-2xl font-bold text-center sm:text-left">
                        ROTEIRO DESCARGA – {appState.settings.bancaName.toUpperCase()}
                    </h1>
                     <Tabs value={selectedBanca} onValueChange={(value) => setSelectedBanca(value as BancaId)} className="w-auto">
                        <TabsList className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/50">
                            <TabsTrigger value="realCariri">Real Cariri</TabsTrigger>
                            <TabsTrigger value="bancaUniao">Banca União</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="date-input" className="font-semibold">Data:</Label>
                    <Input 
                        id="date-input"
                        type="date" 
                        value={appState.date}
                        onChange={(e) => updateSettings({ ...appState.settings, date: e.target.value })}
                        className="w-40 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/50"
                    />
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
