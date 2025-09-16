"use client";

import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

const PeriodTotals = () => {
    const { appState, commissions, balances } = useAppContext();

    const periodTotals = useMemo(() => {
        const calculateTotals = (period: 'manha' | 'tarde' | 'noite') => {
            const group = `grupo${period.charAt(0).toUpperCase() + period.slice(1)}` as 'grupoManha' | 'grupoTarde' | 'grupoNoite';
            
            const entradas = appState.log.entradas[period] + appState.log.entradas[group];
            const comissao = commissions[period] + commissions[group];
            const premios = appState.log.premios[period] + appState.log.premios[group];
            const saldoFinal = balances[period] + balances[group];
            
            return { entradas, comissao, premios, saldoFinal };
        };

        return {
            manha: calculateTotals('manha'),
            tarde: calculateTotals('tarde'),
            noite: calculateTotals('noite'),
        };
    }, [appState.log, commissions, balances]);

    return (
        <div className="container mx-auto px-4 py-4">
            <Card className="bg-muted/30 border-dashed">
                <CardHeader>
                    <CardTitle className="text-center text-xl font-bold">Totais por Período</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    {/* Manhã */}
                    <Card className="p-4 bg-background rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg mb-3">Manhã Total</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-muted-foreground">Entradas:</span>
                                <span>{formatCurrency(periodTotals.manha.entradas)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-muted-foreground">Comissão:</span>
                                <span className="text-destructive">{formatCurrency(periodTotals.manha.comissao)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-muted-foreground">Prêmios:</span>
                                <span>{formatCurrency(periodTotals.manha.premios)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t mt-2">
                                <span className="font-bold text-muted-foreground">Saldo:</span>
                                <span className={cn("font-bold", periodTotals.manha.saldoFinal >= 0 ? "text-green-600" : "text-destructive")}>
                                    {formatCurrency(periodTotals.manha.saldoFinal)}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Tarde */}
                    <Card className="p-4 bg-background rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg mb-3">Tarde Total</h3>
                        <div className="space-y-2 text-sm">
                             <div className="flex justify-between">
                                <span className="font-semibold text-muted-foreground">Entradas:</span>
                                <span>{formatCurrency(periodTotals.tarde.entradas)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-muted-foreground">Comissão:</span>
                                <span className="text-destructive">{formatCurrency(periodTotals.tarde.comissao)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-muted-foreground">Prêmios:</span>
                                <span>{formatCurrency(periodTotals.tarde.premios)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t mt-2">
                                <span className="font-bold text-muted-foreground">Saldo:</span>
                                <span className={cn("font-bold", periodTotals.tarde.saldoFinal >= 0 ? "text-green-600" : "text-destructive")}>
                                    {formatCurrency(periodTotals.tarde.saldoFinal)}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Noite */}
                    <Card className="p-4 bg-background rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg mb-3">Noite Total</h3>
                        <div className="space-y-2 text-sm">
                             <div className="flex justify-between">
                                <span className="font-semibold text-muted-foreground">Entradas:</span>
                                <span>{formatCurrency(periodTotals.noite.entradas)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-muted-foreground">Comissão:</span>
                                <span className="text-destructive">{formatCurrency(periodTotals.noite.comissao)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-muted-foreground">Prêmios:</span>
                                <span>{formatCurrency(periodTotals.noite.premios)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t mt-2">
                                <span className="font-bold text-muted-foreground">Saldo:</span>
                                <span className={cn("font-bold", periodTotals.noite.saldoFinal >= 0 ? "text-green-600" : "text-destructive")}>
                                    {formatCurrency(periodTotals.noite.saldoFinal)}
                                </span>
                            </div>
                        </div>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
};

export default PeriodTotals;
