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
    <div className="container mx-auto px-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-primary/90 text-primary-foreground">
              <TableRow>
                <TableHead className="w-[150px] font-bold text-primary-foreground">Item</TableHead>
                {COLUMNS.map((col) => (
                  <TableHead key={col} className="text-right font-bold text-primary-foreground min-w-[150px]">
                    {COLUMN_NAMES[col]}
                  </TableHead>
                ))}
                <TableHead className="text-right font-bold text-primary-foreground min-w-[150px]">Diário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Entradas Geral</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col} className="text-right">
                    <CurrencyInput
                      value={appState.log.entradas[col]}
                      onValueChange={(value) => updateLog(col, "entradas", value)}
                    />
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold">{formatCurrency(rowTotals.entradas)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-destructive">Comissão</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col} className="text-right text-destructive">
                    {formatCurrency(commissions[col])}
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold text-destructive">{formatCurrency(rowTotals.comissao)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Prêmios</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col} className="text-right">
                    <CurrencyInput
                      value={appState.log.premios[col]}
                      onValueChange={(value) => updateLog(col, "premios", value)}
                    />
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold">{formatCurrency(rowTotals.premios)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Saldo Final</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col}
                    className={cn(
                      "text-right font-bold",
                      balances[col] >= 0 ? "text-green-600" : "text-destructive"
                    )}
                  >
                    {formatCurrency(balances[col])}
                     {appState.log.entradas[col] > 0 && (appState.log.entradas[col] < commissions[col] + appState.log.premios[col]) && <div className="text-xs font-normal">Aviso: Negativo</div>}
                  </TableCell>
                ))}
                <TableCell
                  className={cn(
                    "text-right font-bold",
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
