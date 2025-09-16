"use client";

import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TotalsFooter = () => {
    const { grandTotals } = useAppContext();

    return (
        <footer className="container mx-auto p-4 mt-4">
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-center text-xl">Totais do Dia</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-background rounded-lg shadow">
                        <h3 className="font-semibold text-muted-foreground">Valor Bruto Total</h3>
                        <p className="text-lg font-bold">{formatCurrency(grandTotals.entradas)}</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg shadow">
                        <h3 className="font-semibold text-muted-foreground">Total Comissão</h3>
                        <p className="text-lg font-bold text-destructive">{formatCurrency(grandTotals.comissao)}</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg shadow">
                        <h3 className="font-semibold text-muted-foreground">Total Prêmios</h3>
                        <p className="text-lg font-bold">{formatCurrency(grandTotals.premios)}</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg shadow">
                        <h3 className="font-semibold text-muted-foreground">Total Final</h3>
                        <p className={cn("text-lg font-bold", grandTotals.saldoFinal >= 0 ? "text-green-600" : "text-destructive")}>{formatCurrency(grandTotals.saldoFinal)}</p>
                    </div>
                </CardContent>
            </Card>
        </footer>
    );
};

export default TotalsFooter;
