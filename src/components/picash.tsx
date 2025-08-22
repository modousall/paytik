

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
  const [operationDetails, setOperationDetails] = useState<PicashFormValues | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  const { balance: merchantBalance, credit: creditMerchant } = useBalance();
  const { addTransaction: addMerchantTransaction } = useTransactions();
  const { users } = useUserManagement();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const config = formConfig[mode];

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

  const handleWithdrawalForClient = (values: PicashFormValues) => {
    const clientUser = users.find(u => u.alias === values.alias);
    if (!clientUser) {
        toast({ title: "Client non trouvé", description: "L'alias du client est invalide.", variant: "destructive" });
        return;
    }

    if (values.amount > clientUser.balance) {
        toast({ title: "Solde client insuffisant", description: "Le solde du client est insuffisant pour ce retrait.", variant: "destructive" });
        return;
    }

    // Simulate multi-account transaction by directly manipulating localStorage
    // This is a workaround for the prototype. In a real app, this would be a single atomic backend transaction.
    
    // 1. Debit the client
    const clientBalanceKey = `midi_balance_${clientUser.alias}`;
    const clientNewBalance = clientUser.balance - values.amount;
    localStorage.setItem(clientBalanceKey, JSON.stringify(clientNewBalance));
    
    // 2. Add transaction to client's history
    const clientTxKey = `midi_transactions_${clientUser.alias}`;
    const clientTxs = JSON.parse(localStorage.getItem(clientTxKey) || '[]');
    const clientNewTx = {
        id: `TXN${Date.now()}`, type: 'sent', counterparty: `Retrait chez ${currentUser.name}`,
        reason: 'Retrait d\'argent', amount: values.amount, date: new Date().toISOString(), status: 'Terminé'
    };
    localStorage.setItem(clientTxKey, JSON.stringify([clientNewTx, ...clientTxs]));
    
    // 3. Credit the merchant
    creditMerchant(values.amount);

    // 4. Add transaction to merchant's history
    addMerchantTransaction({
      type: "received", counterparty: `Retrait pour ${clientUser.name}`,
      reason: `Service de retrait cash`, amount: values.amount,
      date: new Date().toISOString(), status: 'Terminé'
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setOperationDetails(values);
    toast({ title: 'Opération réussie', description: `Un code a été généré pour valider l'opération.` });
  }

  const handleSelfWithdrawal = (values: PicashFormValues) => {
      if (values.amount > merchantBalance) {
        toast({ title: "Solde insuffisant", description: "Votre solde est insuffisant pour effectuer cette opération.", variant: "destructive" });
        return;
    }
     // In this mode, the merchant is withdrawing from their own account at another point of service.
    // The actual debit will happen when the code is used. Here, we just generate the code.
    // For the simulation, we'll debit immediately.
    creditMerchant(values.amount); // Simulate the other merchant getting the money
    addMerchantTransaction({
      type: "sent", counterparty: values.alias, reason: "Retrait / Compensation",
      amount: values.amount, date: new Date().toISOString(), status: "Terminé"
    });
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setOperationDetails(values);
    toast({ title: 'Opération réussie', description: `Un code a été généré pour valider l'opération.` });
  }

  const onSubmit = (values: PicashFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
        if (mode === 'customer_withdrawal') {
            handleWithdrawalForClient(values);
        } else {
            handleSelfWithdrawal(values);
        }
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
    setOperationDetails(null);
    form.reset();
  }
  
  const handleScannedCode = (decodedText: string) => {
     try {
        const data = JSON.parse(decodedText);
        form.setValue('alias', data.shid || decodedText, { shouldValidate: true });
    } catch(e) {
        form.setValue('alias', decodedText, { shouldValidate: true });
    }
    setIsScannerOpen(false);
    toast({ title: "Code Scanné", description: "L'alias a été inséré." });
  }

  if (generatedCode && operationDetails) {
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
                            : `Un retrait de ${formatCurrency(operationDetails.amount)} a été effectué pour le client ${operationDetails.alias}.`
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
