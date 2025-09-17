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
      <div id="printable-table-area" className="border rounded-lg overflow-hidden shadow-sm printable-area">
        <h2 className="text-xl font-bold text-center py-3 bg-muted/20 no-print md:text-2xl">
            Painel de Lançamentos
        </h2>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[150px] min-w-[120px] font-bold text-foreground px-4 text-left">Item</TableHead>
                {COLUMNS.map((col) => (
                  <TableHead key={col} className="text-center font-bold text-foreground min-w-[150px] px-4 whitespace-nowrap">
                    {COLUMN_NAMES[col]}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-foreground min-w-[150px] px-4 whitespace-nowrap">Diário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium px-4 whitespace-nowrap text-left">Entradas Geral</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col} className="p-2 whitespace-nowrap">
                    <CurrencyInput
                      value={appState.log.entradas[col]}
                      onValueChange={(value) => updateLog(col, "entradas", value)}
                      className="text-right w-full print:hidden"
                    />
                     <span className="currency-value hidden print:block text-right w-full">{formatCurrency(appState.log.entradas[col])}</span>
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold px-4 whitespace-nowrap">{formatCurrency(rowTotals.entradas)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium text-destructive px-4 whitespace-nowrap text-left">Comissão</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col} className="text-right text-destructive font-medium px-4 whitespace-nowrap">
                    <span className="currency-value">{formatCurrency(commissions[col])}</span>
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold text-destructive px-4 whitespace-nowrap">
                  <span className="currency-value">{formatCurrency(rowTotals.comissao)}</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium px-4 whitespace-nowrap text-left">Prêmios</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col} className="p-2 whitespace-nowrap">
                    <CurrencyInput
                      value={appState.log.premios[col]}
                      onValueChange={(value) => updateLog(col, "premios", value)}
                      className="text-right w-full print:hidden"
                    />
                    <span className="currency-value hidden print:block text-right w-full">{formatCurrency(appState.log.premios[col])}</span>
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold px-4 whitespace-nowrap">{formatCurrency(rowTotals.premios)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell className="font-medium px-4 whitespace-nowrap text-left">Saldo Final</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col}
                    className={cn(
                      "text-right font-bold px-4 whitespace-nowrap",
                      balances[col] >= 0 ? "text-green-600" : "text-destructive"
                    )}
                  >
                    <span className="currency-value">{formatCurrency(balances[col])}</span>
                     {appState.log.entradas[col] > 0 && (appState.log.entradas[col] < commissions[col] + appState.log.premios[col]) && <div className="text-xs font-normal text-center print:hidden">Aviso: Negativo</div>}
                  </TableCell>
                ))}
                <TableCell
                  className={cn(
                    "text-right font-bold px-4 whitespace-nowrap",
                    rowTotals.saldoFinal >= 0 ? "text-green-600" : "text-destructive"
                  )}
                >
                  <span className="currency-value">{formatCurrency(rowTotals.saldoFinal)}</span>
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
