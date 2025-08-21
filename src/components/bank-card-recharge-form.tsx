

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard } from 'lucide-react';
import { useTransactions } from '@/hooks/use-transactions';
import { useBalance } from '@/hooks/use-balance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '@/lib/utils';

const cardRechargeSchema = z.object({
  cardNumber: z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$/, { message: "Le numéro de carte doit être au format XXXX XXXX XXXX XXXX." }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "La date d'expiration doit être au format MM/AA." }),
  cvv: z.string().min(3, { message: "Le CVV doit comporter 3 chiffres." }).max(4),
  amount: z.coerce.number().positive({ message: "Le montant doit être positif." }),
});

type CardRechargeFormValues = z.infer<typeof cardRechargeSchema>;

type BankCardRechargeFormProps = {
    onRechargeSuccess: () => void;
}

export default function BankCardRechargeForm({ onRechargeSuccess }: BankCardRechargeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  const { credit } = useBalance();

  const form = useForm<CardRechargeFormValues>({
    resolver: zodResolver(cardRechargeSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      amount: '' as any,
    },
  });

  function onSubmit(values: CardRechargeFormValues) {
    setIsLoading(true);
    
    setTimeout(() => {
        credit(values.amount);
        addTransaction({
            type: "card_recharge",
            counterparty: `Carte **** ${values.cardNumber.slice(-4)}`,
            reason: `Rechargement par carte`,
            date: new Date().toISOString(),
            amount: values.amount,
            status: "Terminé",
        });

        toast({
            title: "Rechargement réussi !",
            description: `Votre compte a été crédité de ${formatCurrency(values.amount)}.`,
        });

        setIsLoading(false);
        form.reset();
        onRechargeSuccess();

    }, 2000);
  }

  return (
    <Card className="border-0 shadow-none">
        <CardHeader>
            <CardTitle>Carte Bancaire</CardTitle>
            <CardDescription>Entrez les détails de votre carte pour approvisionner votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Numéro de carte</FormLabel>
                        <FormControl>
                            <Input placeholder="0000 0000 0000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Expiration (MM/AA)</FormLabel>
                            <FormControl>
                                <Input placeholder="12/28" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cvv"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                            <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Payer {form.getValues('amount') > 0 ? formatCurrency(form.getValues('amount')) : ''}
                </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
