
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, QrCode, ScanLine, KeyRound, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import QRCodeScanner from './qr-code-scanner';
import { formatCurrency } from '@/lib/utils';
import { MerchantSelector } from './merchant-selector';
import { useBalance } from '@/hooks/use-balance';
import { useTransactions } from '@/hooks/use-transactions';
import { useUserManagement } from '@/hooks/use-user-management';

const withdrawalFormSchema = z.object({
  merchantAlias: z.string().min(1, { message: "Veuillez sélectionner un point de service." }),
  amount: z.coerce.number().positive({ message: "Le montant du retrait doit être positif." }),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

type PinConfirmDialogProps = {
    onConfirm: (pin: string) => void;
}

const PinConfirmDialog = ({ onConfirm }: PinConfirmDialogProps) => {
    const [pin, setPin] = useState('');
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><KeyRound/> Confirmez votre identité</DialogTitle>
                <DialogDescription>
                    Veuillez entrer votre code PIN à 4 chiffres pour autoriser cette opération de retrait.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                 <Label htmlFor="pin-confirm">Code PIN</Label>
                <Input
                    id="pin-confirm"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={4}
                    placeholder="••••"
                    className="text-center tracking-widest text-lg h-12"
                />
            </div>
            <DialogFooter>
                 <DialogClose asChild><Button variant="ghost">Annuler</Button></DialogClose>
                 <DialogClose asChild>
                    <Button onClick={() => onConfirm(pin)} disabled={pin.length !== 4}>Confirmer</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

type ClientWithdrawalFormProps = {
  onBack: () => void;
  withdrawalType: 'GAB' | 'Marchand';
  alias: string;
};

export default function ClientWithdrawalForm({ onBack, withdrawalType, alias }: ClientWithdrawalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [didScan, setDidScan] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [operationDetails, setOperationDetails] = useState<WithdrawalFormValues | null>(null);
  const { toast } = useToast();
  const { balance, debit } = useBalance();
  const { addTransaction } = useTransactions();
  const { changeUserPin } = useUserManagement();

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      merchantAlias: withdrawalType === 'GAB' ? 'GAB Midi' : '',
      amount: '' as any,
    },
  });

  const amount = form.watch('amount');
  const fee = withdrawalType === 'GAB' ? 250 : 100; // Example fee
  const total = (Number(amount) || 0) + fee;

  const handleScannedCode = (decodedText: string) => {
     try {
        const data = JSON.parse(decodedText);
        form.setValue('merchantAlias', data.shid || decodedText, { shouldValidate: true });
    } catch(e) {
        form.setValue('merchantAlias', decodedText, { shouldValidate: true });
    }
    setDidScan(true);
    setIsScannerOpen(false);
    toast({ title: "Code Scanné", description: "Le point de retrait a été identifié." });
  }

  const onSubmit = (values: WithdrawalFormValues) => {
      if (total > balance) {
          toast({ title: "Solde insuffisant", description: `Votre solde de ${formatCurrency(balance)} est insuffisant pour retirer ${formatCurrency(total)}.`, variant: "destructive"});
          return;
      }
      setOperationDetails(values);
      setShowPinConfirm(true);
  }

  const onPinConfirm = (pin: string) => {
      setShowPinConfirm(false);
      setIsLoading(true);

      const pinCheckResult = changeUserPin(alias, pin, pin); // Hack: use changePin to verify
      if (!pinCheckResult.success) {
          toast({ title: "Code PIN incorrect", variant: "destructive" });
          setIsLoading(false);
          return;
      }

      // PIN is correct, proceed with transaction
      setTimeout(() => {
          if (operationDetails) {
            debit(total);

            if(didScan) { // Transaction is immediate if QR code was scanned
                addTransaction({
                    type: 'sent',
                    counterparty: operationDetails.merchantAlias,
                    reason: `Retrait ${withdrawalType}`,
                    date: new Date().toISOString(),
                    amount: total,
                    status: 'Terminé'
                });
                toast({ title: 'Retrait Effectué!', description: `Vous avez retiré ${formatCurrency(operationDetails.amount)}.`});
                onBack();
            } else { // Generate a code if alias was selected manually
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                // When generating a code, the counterparty is generic.
                addTransaction({
                    type: 'sent',
                    counterparty: 'Code de retrait',
                    reason: `Retrait ${withdrawalType} - Code: ${code}`,
                    date: new Date().toISOString(),
                    amount: total,
                    status: 'En attente'
                });
                setGeneratedCode(code);
                toast({ title: "Code de retrait généré", description: "Présentez ce code pour obtenir votre argent." });
            }
          }
          setIsLoading(false);
      }, 1000);
  }
  
   const handleCopyCode = () => {
    if(!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast({ title: "Copié !", description: "Le code de retrait a été copié." });
  }
  
  if (generatedCode && operationDetails) {
       return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <h2 className="text-2xl font-bold text-primary">Code de Retrait</h2>
            </div>
            <Card className="max-w-sm mx-auto text-center">
                <CardHeader>
                    <CardTitle>Code à usage unique</CardTitle>
                    <CardDescription>
                        Présentez ce code à n'importe quel marchand ou GAB pour finaliser votre retrait de {formatCurrency(operationDetails.amount)}.
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
          <h2 className="text-2xl font-bold text-primary">Retrait {withdrawalType}</h2>
          <p className="text-muted-foreground">Sélectionnez un point de service et entrez le montant.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
            {withdrawalType === 'Marchand' && (
                <FormField
                    control={form.control}
                    name="merchantAlias"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Marchand</FormLabel>
                        <div className="flex gap-2">
                            <MerchantSelector value={field.value} onChange={(value) => { field.onChange(value); setDidScan(false); }} />
                            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" aria-label="Scanner le QR Code">
                                        <QrCode />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md p-0">
                                    <DialogHeader className="p-4"><DialogTitle>Scanner le code du point de retrait</DialogTitle></DialogHeader>
                                    <QRCodeScanner onScan={handleScannedCode}/>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
             {withdrawalType === 'GAB' && (
                <FormItem>
                    <FormLabel>Point de service</FormLabel>
                    <div className="flex items-center justify-between p-3 border rounded-md bg-secondary">
                        <p className="font-medium">GAB Midi</p>
                        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline"><ScanLine className="mr-2"/>Scanner un GAB</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md p-0">
                                <DialogHeader className="p-4"><DialogTitle>Scanner le QR Code du GAB</DialogTitle></DialogHeader>
                                <QRCodeScanner onScan={handleScannedCode}/>
                            </DialogContent>
                        </Dialog>
                    </div>
                </FormItem>
             )}
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

          {amount > 0 && (
             <Card className="bg-secondary/50">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Montant à retirer</span> <span>{formatCurrency(amount)}</span></div>
                <div className="flex justify-between"><span>Frais de service</span> <span>{formatCurrency(fee)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total à débiter</span> <span>{formatCurrency(total)}</span></div>
              </CardContent>
            </Card>
          )}

          <Dialog open={showPinConfirm} onOpenChange={setShowPinConfirm}>
              <DialogTrigger asChild>
                <Button type="submit" className="w-full py-6" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continuer
                </Button>
              </DialogTrigger>
              {showPinConfirm && <PinConfirmDialog onConfirm={onPinConfirm} />}
          </Dialog>
        </form>
      </Form>
    </div>
  );
}
