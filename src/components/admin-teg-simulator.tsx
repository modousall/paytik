
"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { Separator } from './ui/separator';
import { formatCurrency, cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Alert, AlertTitle } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';

const MAX_ANNUAL_APR = 0.15; // 15%

const simulatorSchema = z.object({
  loanAmount: z.coerce.number().positive("Le montant doit être positif.").min(1000, "Le montant doit être d'au moins 1000 F."),
  duration: z.coerce.number().int().positive("La durée doit être positive."),
  periodicity: z.enum(['days', 'weeks', 'months']),
  firstInstallmentDate: z.date(),
});
type SimulatorFormValues = z.infer<typeof simulatorSchema>;

// Actuarial function to calculate installment amount (PMT)
const calculatePMT = (rate: number, nper: number, pv: number): number => {
    if (rate === 0) return pv / nper;
    const pmt = (pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
    return pmt;
};

export default function AdminTegSimulator() {
    const form = useForm<SimulatorFormValues>({
        resolver: zodResolver(simulatorSchema),
        defaultValues: {
            loanAmount: 50000,
            duration: 12,
            periodicity: 'weeks',
            firstInstallmentDate: addDays(new Date(), 7),
        },
    });

    const { loanAmount, duration, periodicity, firstInstallmentDate } = form.watch();

    const results = useMemo(() => {
        if (loanAmount > 0 && duration > 0 && firstInstallmentDate) {
            let periodicRate = 0;
            let periodsInYear = 0;

            switch(periodicity) {
                case 'days': 
                    periodsInYear = 365;
                    break;
                case 'weeks':
                    periodsInYear = 52;
                    break;
                case 'months':
                    periodsInYear = 12;
                    break;
            }
            
            periodicRate = Math.pow(1 + MAX_ANNUAL_APR, 1 / periodsInYear) - 1;
            
            const installmentAmount = calculatePMT(periodicRate, duration, loanAmount);
            const totalRepaid = installmentAmount * duration;
            const totalCost = totalRepaid - loanAmount;

            // Generate amortization schedule
            const schedule = [];
            let remainingBalance = loanAmount;
            let installmentDate = firstInstallmentDate;

            for (let i = 1; i <= duration; i++) {
                const interestComponent = remainingBalance * periodicRate;
                const principalComponent = installmentAmount - interestComponent;
                remainingBalance -= principalComponent;

                schedule.push({
                    number: i,
                    date: format(installmentDate, 'dd/MM/yyyy', { locale: fr }),
                    payment: installmentAmount,
                    principal: principalComponent,
                    interest: interestComponent,
                    balance: remainingBalance > 0.01 ? remainingBalance : 0,
                });

                if (periodicity === 'days') installmentDate = addDays(installmentDate, 1);
                if (periodicity === 'weeks') installmentDate = addWeeks(installmentDate, 1);
                if (periodicity === 'months') installmentDate = addMonths(installmentDate, 1);
            }
            
            return {
                annualTeg: MAX_ANNUAL_APR * 100,
                installmentAmount,
                totalCost,
                totalRepaid,
                schedule
            };
        }
        return null;
    }, [loanAmount, duration, periodicity, firstInstallmentDate]);

    return (
        <DialogContent className="max-w-4xl h-[90vh]">
            <DialogHeader>
                <DialogTitle>Simulateur de Crédit Conforme (TEG Plafonné)</DialogTitle>
                <DialogDescription>
                    Modélisez des offres de crédit en vous assurant que le TEG annuel ne dépasse jamais 15%.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 h-full overflow-hidden">
                {/* Form Section */}
                <div className="md:col-span-1 flex flex-col gap-6">
                     <Form {...form}>
                        <form className="space-y-4">
                             <FormField control={form.control} name="loanAmount" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Montant du prêt (Fcfa)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="grid grid-cols-2 gap-4">
                                 <FormField control={form.control} name="duration" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Durée</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="periodicity" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Périodicité</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="days">Jours</SelectItem>
                                                <SelectItem value="weeks">Semaines</SelectItem>
                                                <SelectItem value="months">Mois</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="firstInstallmentDate" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date 1ère échéance</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </form>
                    </Form>
                     {results && (
                        <Card>
                            <CardHeader><CardTitle>Résultats de la Simulation</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                 <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Montant de l'échéance</span> <span className="text-lg font-bold text-primary">{formatCurrency(results.installmentAmount)}</span></div>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Coût total du crédit</span> <span>{formatCurrency(results.totalCost)}</span></div>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Montant total remboursé</span> <span>{formatCurrency(results.totalRepaid)}</span></div>
                                 <Separator className="my-2"/>
                                 <div className="flex justify-between"><span className="text-muted-foreground">TEG Annuel Appliqué</span> <span className="font-bold">{results.annualTeg.toFixed(2)} %</span></div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Results Section */}
                <div className="md:col-span-2 flex flex-col h-full">
                    <Card className="flex-grow flex flex-col">
                        <CardHeader>
                            <CardTitle>Plan d'Amortissement</CardTitle>
                            <CardDescription>Détail des remboursements sur la durée du prêt.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-hidden">
                            <ScrollArea className="h-full">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-secondary">
                                        <TableRow>
                                            <TableHead className="w-[50px]">N°</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Échéance</TableHead>
                                            <TableHead className="text-right">Principal</TableHead>
                                            <TableHead className="text-right">Intérêts</TableHead>
                                            <TableHead className="text-right">Solde Restant</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results?.schedule.map(row => (
                                            <TableRow key={row.number}>
                                                <TableCell className="font-medium">{row.number}</TableCell>
                                                <TableCell>{row.date}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.payment)}</TableCell>
                                                <TableCell className="text-right text-green-600">{formatCurrency(row.principal)}</TableCell>
                                                <TableCell className="text-right text-red-600">{formatCurrency(row.interest)}</TableCell>
                                                <TableCell className="text-right font-bold">{formatCurrency(row.balance)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {!results && (
                                    <div className="text-center text-muted-foreground p-8">
                                        <p>Entrez les paramètres du prêt pour générer l'échéancier.</p>
                                    </div>
                                )}
                             </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DialogContent>
    );
}
