
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

const picoFormSchema = z.object({
  merchantAlias: z.string().min(1, { message: "L'alias du marchand est requis." }),
  purchaseAmount: z.coerce.number().positive({ message: "Le montant de l'achat doit être positif." }),
  cashOutAmount: z.coerce.number().positive({ message: "Le montant du retrait doit être positif." }),
});

type PicoFormValues = z.infer<typeof picoFormSchema>;

type PicoProps = {
  onBack: () => void;
};

export default function PICO({ onBack }: PicoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PicoFormValues>({
    resolver: zodResolver(picoFormSchema),
    defaultValues: {
      merchantAlias: '',
      purchaseAmount: '' as any,
      cashOutAmount: '' as any,
    },
  });

  const purchaseAmount = form.watch('purchaseAmount');
  const cashOutAmount = form.watch('cashOutAmount');
  const totalAmount = (Number(purchaseAmount) || 0) + (Number(cashOutAmount) || 0);

  const onSubmit = (values: PicoFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Opération PICO initiée',
        description: `Un paiement de ${totalAmount.toLocaleString()} Fcfa à ${values.merchantAlias} a été effectué.`,
      });
      setIsLoading(false);
      form.reset();
    }, 1500);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">PICO (Achat + Retrait)</h2>
          <p className="text-muted-foreground">Payez et retirez du cash en une seule opération.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
          <FormField
            control={form.control}
            name="merchantAlias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias ou Code Marchand</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez l'identifiant du marchand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="purchaseAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant de l'achat</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ex: 5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cashOutAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant du retrait</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ex: 10000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {totalAmount > 0 && (
             <Card className="bg-secondary/50">
              <CardHeader className='pb-2'>
                <CardTitle className="text-lg">Total de l'opération</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-2xl text-primary">{totalAmount.toLocaleString()} Fcfa</p>
                <p className="text-sm text-muted-foreground">
                    {purchaseAmount.toLocaleString()} Fcfa (Achat) + {cashOutAmount.toLocaleString()} Fcfa (Retrait)
                </p>
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full py-6" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmer l'opération
          </Button>
        </form>
      </Form>
    </div>
  );
}
