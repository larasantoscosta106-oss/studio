"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AppHeader = () => {
    const { appState, updateSettings } = useAppContext();
    
    return (
        <header className="bg-primary text-primary-foreground p-4 shadow-md no-print">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-center sm:text-left">
                    ROTEIRO DESCARGA – {appState.settings.bancaName.toUpperCase()}
                </h1>
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
