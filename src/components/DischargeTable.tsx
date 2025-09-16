"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/utils";
import CurrencyInput from "./CurrencyInput";
import { cn } from "@/lib/utils";
import { COLUMNS } from "@/lib/types";

const COLUMN_NAMES: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  grupoManha: "Grupo Manhã",
  grupoTarde: "Grupo Tarde",
  grupoNoite: "Grupo Noite",
};

const DischargeTable = () => {
  const { appState, commissions, balances, rowTotals, updateLog } = useAppContext();

  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="border rounded-lg overflow-hidden shadow-sm printable-area">
        <h2 className="text-xl font-bold text-center py-3 bg-muted/20 no-print">
            Painel de Lançamentos
        </h2>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[150px] font-bold text-foreground px-4">Item</TableHead>
                {COLUMNS.map((col) => (
                  <TableHead key={col} className="text-center font-bold text-foreground min-w-[150px] px-4">
                    {COLUMN_NAMES[col]}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-foreground min-w-[150px] px-4">Diário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium px-4">Entradas Geral</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col} className="px-4">
                    <CurrencyInput
                      value={appState.log.entradas[col]}
                      onValueChange={(value) => updateLog(col, "entradas", value)}
                      className="text-right"
                    />
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold px-4">{formatCurrency(rowTotals.entradas)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium text-destructive px-4">Comissão</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col} className="text-right text-destructive font-medium px-4">
                    {formatCurrency(commissions[col])}
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold text-destructive px-4">{formatCurrency(rowTotals.comissao)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium px-4">Prêmios</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col} className="px-4">
                    <CurrencyInput
                      value={appState.log.premios[col]}
                      onValueChange={(value) => updateLog(col, "premios", value)}
                      className="text-right"
                    />
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold px-4">{formatCurrency(rowTotals.premios)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell className="font-medium px-4">Saldo Final</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col}
                    className={cn(
                      "text-right font-bold px-4",
                      balances[col] >= 0 ? "text-green-600" : "text-destructive"
                    )}
                  >
                    {formatCurrency(balances[col])}
                     {appState.log.entradas[col] > 0 && (appState.log.entradas[col] < commissions[col] + appState.log.premios[col]) && <div className="text-xs font-normal text-center">Aviso: Negativo</div>}
                  </TableCell>
                ))}
                <TableCell
                  className={cn(
                    "text-right font-bold px-4",
                    rowTotals.saldoFinal >= 0 ? "text-green-600" : "text-destructive"
                  )}
                >
                  {formatCurrency(rowTotals.saldoFinal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DischargeTable;
