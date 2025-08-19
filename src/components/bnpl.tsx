
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const bnplFormSchema = z.object({
  merchantAlias: z.string().min(1, { message: "L'alias du marchand est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant de l'achat doit être positif." }),
});

type BnplFormValues = z.infer<typeof bnplFormSchema>;

type BnplProps = {
  onBack: () => void;
};

export default function BNPL({ onBack }: BnplProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<BnplFormValues>({
    resolver: zodResolver(bnplFormSchema),
    defaultValues: {
      merchantAlias: '',
      amount: '' as any,
    },
  });

  const onSubmit = (values: BnplFormValues) => {
    setIsLoading(true);
    // Simulate API call for credit check
    setTimeout(() => {
      toast({
        title: 'Demande de crédit soumise',
        description: `Votre demande de paiement en plusieurs fois est en cours d'examen.`,
      });
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if(isSubmitted) {
    return (
        <div>
             <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
            </div>
            <Alert className='max-w-lg mx-auto'>
                <Info className="h-4 w-4" />
                <AlertTitle>Demande Reçue !</AlertTitle>
                <AlertDescription>
                    Votre demande de paiement échelonné a bien été enregistrée. Vous recevrez une notification une fois qu'elle aura été examinée par nos services.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">BNPL (Acheter maintenant, Payer plus tard)</h2>
          <p className="text-muted-foreground">Financez vos achats et payez en plusieurs fois.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Ce service est soumis à une vérification d'éligibilité. Soumettre une demande ne garantit pas son approbation.
            </AlertDescription>
          </Alert>

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
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant total de l'achat (Fcfa)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ex: 150000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full py-6" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Soumettre la demande de crédit
          </Button>
        </form>
      </Form>
    </div>
  );
}
