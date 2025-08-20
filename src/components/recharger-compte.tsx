
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from 'lucide-react';
import { useTransactions } from '@/hooks/use-transactions';
import { useBalance } from '@/hooks/use-balance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const rechargeFormSchema = z.object({
  operator: z.string().min(1, { message: "L'opérateur est requis." }),
  phone: z.string().min(9, { message: "Le numéro de téléphone est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant doit être positif." }),
});

type RechargeFormValues = z.infer<typeof rechargeFormSchema>;

const operators = [
    { id: "Wave", name: "Wave" },
    { id: "Orange Money", name: "Orange Money" },
    { id: "Free Money", name: "Free Money" },
    { id: "Wizall", name: "Wizall Money" },
];

type RechargerCompteProps = {
    onBack: () => void;
}

export default function RechargerCompte({ onBack }: RechargerCompteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  const { credit } = useBalance();

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
            description: `Veuillez confirmer le paiement de ${values.amount.toLocaleString()} Fcfa sur votre téléphone.`,
        });

        setIsLoading(false);
        form.reset();
        onBack();

    }, 2000);
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft />
        </Button>
        <h2 className="text-2xl font-bold text-primary">Recharger le compte</h2>
      </div>

      <p className="text-muted-foreground mb-6">Approvisionnez votre solde principal depuis un compte mobile money.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
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
                        {operators.map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
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
                <FormLabel>Montant (Fcfa)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Recharger
          </Button>
        </form>
      </Form>
    </>
  );
}
