
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Copy, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useBalance } from '@/hooks/use-balance';
import { useTransactions } from '@/hooks/use-transactions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import QRCodeScanner from './qr-code-scanner';

const picashFormSchema = z.object({
  merchantAlias: z.string().min(1, { message: "L'alias du marchand est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant du retrait doit être positif." }),
});

type PicashFormValues = z.infer<typeof picashFormSchema>;

type PicashProps = {
  onBack: () => void;
};

export default function PICASH({ onBack }: PicashProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  const { balance, debit } = useBalance();
  const { addTransaction } = useTransactions();

  const form = useForm<PicashFormValues>({
    resolver: zodResolver(picashFormSchema),
    defaultValues: {
      merchantAlias: '',
      amount: '' as any,
    },
  });

  const onSubmit = (values: PicashFormValues) => {
    if (values.amount > balance) {
        toast({
            title: "Solde insuffisant",
            description: "Votre solde principal est insuffisant pour effectuer ce retrait.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    // Simulate API call to generate a withdrawal code
    setTimeout(() => {
      debit(values.amount);
      addTransaction({
          type: "sent",
          counterparty: `PICASH - ${values.merchantAlias}`,
          reason: `Retrait d'argent`,
          date: new Date().toISOString(),
          amount: values.amount,
          status: "Terminé",
      });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      toast({
        title: 'Code de retrait généré',
        description: `Présentez ce code au marchand ${values.merchantAlias} pour retirer ${values.amount.toLocaleString()} Fcfa.`,
      });
      setIsLoading(false);
    }, 1500);
  };
  
  const handleCopyCode = () => {
    if(!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast({ title: "Copié !", description: "Le code de retrait a été copié." });
  }

  const resetForm = () => {
    setGeneratedCode(null);
    form.reset();
  }
  
  const handleScannedCode = (decodedText: string) => {
    form.setValue('merchantAlias', decodedText, { shouldValidate: true });
    setIsScannerOpen(false);
    toast({ title: "Code Scanné", description: "L'alias du marchand a été inséré." });
  }

  if (generatedCode) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={resetForm} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <h2 className="text-2xl font-bold text-primary">Code de Retrait</h2>
            </div>
            <Card className="max-w-sm mx-auto text-center">
                <CardHeader>
                    <CardTitle>Votre code à usage unique</CardTitle>
                    <CardDescription>Présentez ce code au marchand pour finaliser votre retrait.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-3xl font-bold tracking-widest">{generatedCode}</p>
                    </div>
                    <Button onClick={handleCopyCode} variant="outline" className="mt-4">
                        <Copy className="mr-2" /> Copier le code
                    </Button>
                </CardContent>
            </Card>
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
          <h2 className="text-2xl font-bold text-primary">Retrait</h2>
          <p className="text-muted-foreground">Générez un code pour retirer du cash chez un marchand.</p>
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
                    <div className="flex gap-2">
                        <Input placeholder="Entrez l'identifiant du marchand" {...field} />
                         <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="icon" aria-label="Scanner le QR Code">
                                    <QrCode />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md p-0">
                                <DialogHeader className="p-4">
                                    <DialogTitle>Scanner le code du marchand</DialogTitle>
                                </DialogHeader>
                                <QRCodeScanner onScan={handleScannedCode}/>
                            </DialogContent>
                        </Dialog>
                    </div>
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
                <FormLabel>Montant à retirer (Fcfa)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ex: 20000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full py-6" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Générer le code de retrait
          </Button>
        </form>
      </Form>
    </div>
  );
}
