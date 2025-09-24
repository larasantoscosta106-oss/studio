"use client";

import React, { useMemo, useState, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SavedDay, RowTotals } from '@/lib/types';
import { format, getWeek, getMonth, getYear, startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";

const ReportsPage = () => {
    const { savedDays, appState, selectedBanca } = useAppContext();
    const { toast } = useToast();
    const printableRef = useRef<HTMLDivElement>(null);
    const [selectedWeek, setSelectedWeek] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    const sortedDays = useMemo(() => {
        return [...savedDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [savedDays]);

    const weeklyData = useMemo(() => {
        const weeks: Record<string, SavedDay[]> = {};
        sortedDays.forEach(day => {
            const date = new Date(day.date + 'T00:00:00');
            const weekNumber = getWeek(date, { weekStartsOn: 1 });
            const year = getYear(date);
            const weekKey = `${year}-W${weekNumber}`;
            if (!weeks[weekKey]) {
                weeks[weekKey] = [];
            }
            weeks[weekKey].push(day);
        });
        return weeks;
    }, [sortedDays]);

    const monthlyData = useMemo(() => {
        const months: Record<string, SavedDay[]> = {};
        sortedDays.forEach(day => {
            const date = new Date(day.date + 'T00:00:00');
            const monthNumber = getMonth(date);
            const year = getYear(date);
            const monthKey = `${year}-M${monthNumber}`;
            if (!months[monthKey]) {
                months[monthKey] = [];
            }
            months[monthKey].push(day);
        });
        return months;
    }, [sortedDays]);

    const weekOptions = Object.keys(weeklyData).map(weekKey => {
        const [year, weekNum] = weekKey.split('-W');
        const firstDayOfWeek = startOfWeek(parseISO(`${year}-01-01T00:00:00.000Z`), { weekStartsOn: 1 });
        const dateInWeek = new Date(firstDayOfWeek);
        dateInWeek.setDate(dateInWeek.getDate() + (parseInt(weekNum) - 1) * 7);
        const weekStart = startOfWeek(dateInWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(dateInWeek, { weekStartsOn: 1 });
        return {
            value: weekKey,
            label: `Semana de ${format(weekStart, 'dd/MM')} a ${format(weekEnd, 'dd/MM/yyyy')}`
        };
    }).reverse();

    const monthOptions = Object.keys(monthlyData).map(monthKey => {
        const [year, monthNum] = monthKey.split('-M');
        const date = new Date(parseInt(year), parseInt(monthNum));
        return {
            value: monthKey,
            label: format(date, "MMMM 'de' yyyy", { locale: ptBR })
        };
    }).reverse();

    const calculateTotals = (days: SavedDay[]): RowTotals => {
        return days.reduce((acc, day) => {
            return {
                entradas: acc.entradas + day.totals.entradas,
                comissao: acc.comissao + day.totals.comissao,
                premios: acc.premios + day.totals.premios,
                saldoFinal: acc.saldoFinal + day.totals.saldoFinal,
            };
        }, { entradas: 0, comissao: 0, premios: 0, saldoFinal: 0 });
    };

    const weekDays = selectedWeek ? weeklyData[selectedWeek] : [];
    const weekTotals = calculateTotals(weekDays);

    const monthDays = selectedMonth ? monthlyData[selectedMonth] : [];
    const monthTotals = calculateTotals(monthDays);
    
    const handleExportPdf = async (reportType: 'semanal' | 'mensal', title: string) => {
        const element = printableRef.current;
        if (!element) return;
        toast({ title: "Gerando PDF...", description: "Por favor, aguarde." });

        try {
            document.body.classList.add('print-capture');
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true,
                logging: false,
            });
            document.body.classList.remove('print-capture');

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            const finalImgWidth = pdfWidth - 20;
            const finalImgHeight = finalImgWidth / ratio;
            
            let heightLeft = finalImgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, finalImgWidth, finalImgHeight);
            heightLeft -= (pdf.internal.pageSize.getHeight() - 20);

            while (heightLeft >= 0) {
                position = heightLeft - finalImgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, finalImgWidth, finalImgHeight);
                heightLeft -= (pdf.internal.pageSize.getHeight() - 20);
            }
            
            const now = new Date();
            const dateTimeString = format(now, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            pdf.text(`Exportado em: ${dateTimeString}`, 10, pdf.internal.pageSize.getHeight() - 5);

            pdf.save(`relatorio_${reportType}_${appState.settings.bancaName.replace(/ /g, '_')}_${title.replace(/ /g, '_')}.pdf`);
            toast({ title: "PDF Gerado!", description: "Seu relatório foi exportado com sucesso." });
        } catch (e: any) {
            console.error(e);
            toast({ variant: "destructive", title: "Erro ao gerar PDF", description: e.message || "Ocorreu um erro inesperado." });
            document.body.classList.remove('print-capture');
        }
    };


    const renderReportTable = (days: SavedDay[], totals: RowTotals, title: string) => (
        <div className='printable-area'>
            <div className="print-only hidden text-center py-4">
                 <h1 className="text-2xl font-bold">Relatório {title} – {appState.settings.bancaName.toUpperCase()}</h1>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[120px] text-left">Data</TableHead>
                        <TableHead className="text-right">Entradas</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                        <TableHead className="text-right">Prêmios</TableHead>
                        <TableHead className="text-right">Saldo Final</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {days.map(day => (
                        <TableRow key={day.id}>
                            <TableCell className="font-medium text-left">{format(new Date(day.date + 'T00:00:00'), 'dd/MM/yy, eee', { locale: ptBR })}</TableCell>
                            <TableCell className="text-right">{formatCurrency(day.totals.entradas)}</TableCell>
                            <TableCell className="text-right text-destructive">{formatCurrency(day.totals.comissao)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(day.totals.premios)}</TableCell>
                            <TableCell className={cn("text-right font-bold", day.totals.saldoFinal >= 0 ? "text-green-600" : "text-destructive")}>
                                {formatCurrency(day.totals.saldoFinal)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted/50 font-bold">
                        <TableCell className="text-left">Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.entradas)}</TableCell>
                        <TableCell className="text-right text-destructive">{formatCurrency(totals.comissao)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.premios)}</TableCell>
                        <TableCell className={cn("text-right font-bold", totals.saldoFinal >= 0 ? "text-green-600" : "text-destructive")}>
                            {formatCurrency(totals.saldoFinal)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-4 space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <CardTitle>Relatório Semanal</CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                                <SelectTrigger className="w-full sm:w-[280px]">
                                    <SelectValue placeholder="Selecione uma semana" />
                                </SelectTrigger>
                                <SelectContent>
                                    {weekOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button size="icon" variant="outline" disabled={!selectedWeek} onClick={() => handleExportPdf('semanal', weekOptions.find(o => o.value === selectedWeek)?.label || selectedWeek)}>
                                <FileText className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedWeek && weekDays.length > 0 ? (
                         <div ref={selectedWeek ? printableRef : null}>
                            {renderReportTable(weekDays, weekTotals, 'Semanal')}
                         </div>
                    ) : (
                        <p className="text-muted-foreground text-center">Selecione uma semana para ver o relatório.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <CardTitle>Relatório Mensal</CardTitle>
                         <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-full sm:w-[280px]">
                                    <SelectValue placeholder="Selecione um mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button size="icon" variant="outline" disabled={!selectedMonth} onClick={() => handleExportPdf('mensal', monthOptions.find(o => o.value === selectedMonth)?.label || selectedMonth)}>
                                <FileText className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedMonth && monthDays.length > 0 ? (
                        <div ref={selectedMonth && !selectedWeek ? printableRef : null}>
                           {renderReportTable(monthDays, monthTotals, 'Mensal')}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center">Selecione um mês para ver o relatório.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportsPage;
