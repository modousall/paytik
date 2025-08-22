

"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Copy, QrCode, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useBalance } from '@/hooks/use-balance';
import { useTransactions } from '@/hooks/use-transactions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import QRCodeScanner from './qr-code-scanner';
import { formatCurrency } from '@/lib/utils';
import { MerchantSelector } from './merchant-selector';
import { useUserManagement } from '@/hooks/use-user-management';
import QrCodeDisplay from './qr-code-display';

const picashFormSchema = z.object({
  alias: z.string().min(1, { message: "L'alias est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant du retrait doit être positif." }),
});

type PicashFormValues = z.infer<typeof picashFormSchema>;

type PicoMode = 'compense' | 'customer_withdrawal';

type PicashProps = {
  onBack: () => void;
  mode: PicoMode;
};

const formConfig: Record<PicoMode, { title: string, description: string, aliasLabel: string, aliasPlaceholder: string, buttonText: string }> = {
    'compense': {
        title: "Retrait / Compensation",
        description: "Générez un code pour retirer du cash chez un autre marchand ou un point de service.",
        aliasLabel: "Alias ou Code Marchand",
        aliasPlaceholder: "Entrez l'identifiant du marchand",
        buttonText: "Générer le code de retrait"
    },
    'customer_withdrawal': {
        title: "Retrait Client",
        description: "Entrez les informations du client pour effectuer un retrait d'argent pour lui.",
        aliasLabel: "Alias du Client",
        aliasPlaceholder: "Entrez l'alias du client",
        buttonText: "Effectuer le retrait pour le client"
    }
}

export default function PICASH({ onBack, mode }: PicashProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  const { balance, debit } = useBalance();
  const { addTransaction } = useTransactions();
  const config = formConfig[mode];
  const { users } = useUserManagement();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const lastAlias = localStorage.getItem('midi_last_alias');
    if (lastAlias) {
      const user = users.find(u => u.alias === lastAlias);
      setCurrentUser(user);
    }
  }, [users]);

  const form = useForm<PicashFormValues>({
    resolver: zodResolver(picashFormSchema),
    defaultValues: {
      alias: '',
      amount: '' as any,
    },
  });

  const onSubmit = (values: PicashFormValues) => {
    if (values.amount > balance) {
        toast({
            title: "Solde insuffisant",
            description: "Votre solde est insuffisant pour effectuer cette opération.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      debit(values.amount);
      
      const transactionReason = mode === 'compense' 
        ? 'Retrait de fonds via partenaire'
        : `Retrait cash pour client ${values.alias}`;
        
      addTransaction({
          type: "sent",
          counterparty: mode === 'compense' ? `Compensation - ${values.alias}` : `Retrait Client - ${values.alias}`,
          reason: transactionReason,
          date: new Date().toISOString(),
          amount: values.amount,
          status: "Terminé",
      });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      toast({
        title: 'Opération réussie',
        description: `Un code a été généré pour valider l'opération.`,
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
    form.setValue('alias', decodedText, { shouldValidate: true });
    setIsScannerOpen(false);
    toast({ title: "Code Scanné", description: "L'alias a été inséré." });
  }

  if (generatedCode) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={resetForm} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <h2 className="text-2xl font-bold text-primary">Code de Validation</h2>
            </div>
            <Card className="max-w-sm mx-auto text-center">
                <CardHeader>
                    <CardTitle>Code à usage unique</CardTitle>
                    <CardDescription>
                        {mode === 'compense' 
                            ? "Présentez ce code au marchand pour finaliser votre retrait." 
                            : "Donnez ce code au client pour qu'il le confirme sur son téléphone."
                        }
                    </CardDescription>
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
          <h2 className="text-2xl font-bold text-primary">{config.title}</h2>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{config.aliasLabel}</FormLabel>
                <div className="flex gap-2">
                    {mode === 'compense' ? (
                        <MerchantSelector value={field.value} onChange={field.onChange} />
                    ) : (
                        <Input placeholder={config.aliasPlaceholder} {...field} />
                    )}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="icon" aria-label="Scanner le QR Code">
                                <QrCode />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xs p-4">
                            <DialogHeader className="mb-4">
                                <DialogTitle className="text-center">Mon Code Midi</DialogTitle>
                            </DialogHeader>
                             {currentUser && (
                                <QrCodeDisplay alias={currentUser.alias} userInfo={currentUser} simpleMode={true} />
                            )}
                            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" className="w-full mt-4"><ScanLine className="mr-2"/>Scanner un code</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md p-0">
                                    <DialogHeader className="p-4"><DialogTitle>Scanner le code QR</DialogTitle></DialogHeader>
                                    <QRCodeScanner onScan={handleScannedCode}/>
                                </DialogContent>
                            </Dialog>
                        </DialogContent>
                    </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant du retrait</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ex: 20000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full py-6" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config.buttonText}
          </Button>
        </form>
      </Form>
    </div>
  );
}
