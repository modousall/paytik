

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useTransactions } from '@/hooks/use-transactions';
import { useBalance } from '@/hooks/use-balance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useProductManagement } from '@/hooks/use-product-management';
import { formatCurrency } from '@/lib/utils';

const rechargeFormSchema = z.object({
  operator: z.string().min(1, { message: "L'opérateur est requis." }),
  phone: z.string().min(9, { message: "Le numéro de téléphone est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant doit être positif." }),
});

type RechargeFormValues = z.infer<typeof rechargeFormSchema>;

type MobileMoneyRechargeFormProps = {
    onRechargeSuccess: () => void;
}

export default function MobileMoneyRechargeForm({ onRechargeSuccess }: MobileMoneyRechargeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  const { credit } = useBalance();
  const { mobileMoneyOperators } = useProductManagement();

  const form = useForm<RechargeFormValues>({
    resolver: zodResolver(rechargeFormSchema),
    defaultValues: {
      operator: "",
      phone: "",
      amount: '' as any,
    },
  });

  function onSubmit(values: RechargeFormValues) {
    setIsLoading(true);
    
    // Simulate API call to mobile money operator
    setTimeout(() => {
        credit(values.amount);
        addTransaction({
            type: "received",
            counterparty: `${values.operator}`,
            reason: `Rechargement depuis ${values.phone}`,
            date: new Date().toISOString(),
            amount: values.amount,
            status: "Terminé",
        });

        toast({
            title: "Rechargement initié",
            description: `Veuillez confirmer le paiement de ${formatCurrency(values.amount)} sur votre téléphone.`,
        });

        setIsLoading(false);
        form.reset();
        onRechargeSuccess();

    }, 2000);
  }

  return (
    <Card className="border-0 shadow-none">
        <CardHeader>
            <CardTitle>Mobile Money</CardTitle>
            <CardDescription>Approvisionnez votre solde principal depuis un compte mobile money.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="operator"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Opérateur Mobile Money</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un opérateur" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {mobileMoneyOperators.map(op => (
                                    <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                            <Input placeholder={`+221 7X XXX XX XX`} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Montant</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="10000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirmer
                </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}

