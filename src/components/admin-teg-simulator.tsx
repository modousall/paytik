
"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calculator } from 'lucide-react';
import { Separator } from './ui/separator';
import { formatCurrency } from '@/lib/utils';

const simulatorSchema = z.object({
  financedAmount: z.coerce.number().positive({ message: "Le montant doit être positif." }),
  installments: z.coerce.number().int().positive({ message: "Le nombre d'échéances doit être positif." }),
  installmentAmount: z.coerce.number().positive({ message: "Le montant de l'échéance doit être positif." }),
});
type SimulatorFormValues = z.infer<typeof simulatorSchema>;

// Rate calculation using Newton-Raphson method
function calculateRate(nper: number, pmt: number, pv: number) {
    const maxIterations = 20;
    const precision = 1.0e-6;
    let rate = 0.1; // Initial guess

    for (let i = 0; i < maxIterations; i++) {
        const g = pmt * (1.0 - Math.pow(1.0 + rate, -nper)) / rate - pv;
        const g_deriv = pmt * (nper * Math.pow(1.0 + rate, -nper - 1) * rate - (1.0 - Math.pow(1.0 + rate, -nper))) / Math.pow(rate, 2);
        const newRate = rate - g / g_deriv;

        if (Math.abs(newRate - rate) < precision) {
            return newRate;
        }
        rate = newRate;
    }
    return rate; // Return best guess if no convergence
}


export default function AdminTegSimulator() {
    const form = useForm<SimulatorFormValues>({
        resolver: zodResolver(simulatorSchema),
        defaultValues: {
            financedAmount: 56000,
            installments: 17,
            installmentAmount: 3379.44,
        },
    });

    const { financedAmount, installments, installmentAmount } = form.watch();

    const results = useMemo(() => {
        if (financedAmount > 0 && installments > 0 && installmentAmount > 0) {
            try {
                const weeklyRate = calculateRate(installments, installmentAmount, financedAmount);
                const annualRate = Math.pow(1 + weeklyRate, 52) - 1;
                const totalCost = (installmentAmount * installments) - financedAmount;

                return {
                    weeklyTeg: weeklyRate * 100,
                    annualTeg: annualRate * 100,
                    totalCost: totalCost,
                };
            } catch(e) {
                console.error("TEG calculation error:", e);
                return null;
            }
        }
        return null;
    }, [financedAmount, installments, installmentAmount]);

    return (
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>Simulateur de TEG (Taux Effectif Global)</DialogTitle>
                <DialogDescription>
                    Calculez le TEG hebdomadaire et annuel en fonction des paramètres du crédit.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                     <Form {...form}>
                        <form className="space-y-4">
                             <FormField
                                control={form.control}
                                name="financedAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Montant financé (Fcfa)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="installments"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre d'échéances (semaines)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="installmentAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Montant de l'échéance (Fcfa)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator /> Résultats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {results ? (
                                <div className="space-y-4">
                                     <div>
                                        <p className="text-sm text-muted-foreground">TEG hebdomadaire</p>
                                        <p className="text-xl font-bold">{results.weeklyTeg.toFixed(4)} %</p>
                                    </div>
                                    <Separator />
                                     <div>
                                        <p className="text-sm text-muted-foreground">TEG annuel</p>
                                        <p className="text-xl font-bold text-primary">{results.annualTeg.toFixed(4)} %</p>
                                    </div>
                                    <Separator />
                                     <div>
                                        <p className="text-sm text-muted-foreground">Coût total du crédit</p>
                                        <p className="text-xl font-bold">{formatCurrency(results.totalCost)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground pt-8">
                                    <p>Veuillez entrer des valeurs valides pour calculer les résultats.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DialogContent>
    );
}
