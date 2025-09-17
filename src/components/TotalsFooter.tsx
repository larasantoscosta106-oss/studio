"use client";

import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TotalsFooter = () => {
    const { grandTotals } = useAppContext();

    return (
        <footer className="container mx-auto px-4 pb-8">
            <Card className="bg-muted/50 border-dashed">
                <CardHeader>
                    <CardTitle className="text-center text-xl font-bold">Totais do Dia</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-background rounded-lg shadow-sm">
                        <h3 className="font-semibold text-muted-foreground text-sm sm:text-base">Valor Bruto Total</h3>
                        <p className="text-2xl font-bold">{formatCurrency(grandTotals.entradas)}</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg shadow-sm">
                        <h3 className="font-semibold text-muted-foreground text-sm sm:text-base">Total Comissão</h3>
                        <p className="text-2xl font-bold text-destructive">{formatCurrency(grandTotals.comissao)}</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg shadow-sm">
                        <h3 className="font-semibold text-muted-foreground text-sm sm:text-base">Total Prêmios</h3>
                        <p className="text-2xl font-bold">{formatCurrency(grandTotals.premios)}</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg shadow-sm">
                        <h3 className="font-semibold text-muted-foreground text-sm sm:text-base">Total Final</h3>
                        <p className={cn("text-2xl font-bold", grandTotals.saldoFinal >= 0 ? "text-green-600" : "text-destructive")}>{formatCurrency(grandTotals.saldoFinal)}</p>
                    </div>
                </CardContent>
            </Card>
        </footer>
    );
};

export default TotalsFooter;
