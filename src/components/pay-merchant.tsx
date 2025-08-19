
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { paymentSecurityAssistant } from '@/ai/flows/payment-security-assistant';
import type { PaymentSecurityAssistantOutput } from '@/ai/flows/payment-security-assistant';
import SecurityAssistantDialog from './security-assistant-dialog';
import { Loader2, ArrowLeft, QrCode } from 'lucide-react';
import { useTransactions } from '@/hooks/use-transactions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import QRCodeScanner from './qr-code-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const paymentFormSchema = z.object({
  recipientAlias: z.string().min(1, { message: "Le code du marchand est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant doit être positif." }),
  reason: z.string().max(140).optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

type PayMerchantProps = {
    onBack: () => void;
}

export default function PayMerchant({ onBack }: PayMerchantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [securityAnalysis, setSecurityAnalysis] = useState<PaymentSecurityAssistantOutput | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentFormValues | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useTransactions();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      recipientAlias: "",
      amount: '' as any,
      reason: "",
    },
  });

  async function onSubmit(values: PaymentFormValues) {
    setIsLoading(true);
    setPaymentDetails(values);
    try {
      const result = await paymentSecurityAssistant({
        recipientAlias: values.recipientAlias,
        recipientAccountDetails: 'Paiement Marchand',
        amount: values.amount,
        transactionType: 'Paiement Marchand',
      });
      setSecurityAnalysis(result);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("L'analyse de sécurité par l'IA a échoué:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer la vérification de sécurité. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handlePaymentConfirm = () => {
      setIsDialogOpen(false);

      if (paymentDetails) {
        addTransaction({
            type: "sent",
            counterparty: paymentDetails.recipientAlias,
            reason: paymentDetails.reason || "Paiement Marchand",
            date: new Date().toISOString(),
            amount: paymentDetails.amount,
            status: "Terminé",
        });
        toast({
            title: "Paiement Effectué!",
            description: `Payé avec succès ${paymentDetails.amount.toLocaleString()} Fcfa à ${paymentDetails.recipientAlias}.`,
        });
      }

      form.reset();
      setSecurityAnalysis(null);
      setPaymentDetails(null);
  };

  const handleScannedCode = (decodedText: string) => {
    try {
        const data = JSON.parse(decodedText);
        if(data.shid) {
            form.setValue('recipientAlias', data.shid, { shouldValidate: true });
            toast({ title: "Marchand détecté !", description: `Code marchand ${data.shid} inséré.` });
        } else {
            form.setValue('recipientAlias', decodedText, { shouldValidate: true });
            toast({ title: "Code scanné", description: "Le code a été inséré dans le champ." });
        }
    } catch(e) {
        // Not a JSON, treat as raw string
        form.setValue('recipientAlias', decodedText, { shouldValidate: true });
        toast({ title: "Code scanné", description: "Le code a été inséré dans le champ." });
    }
    setIsScannerOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft />
        </Button>
        <h2 className="text-2xl font-bold text-primary">Payer un Marchand</h2>
      </div>

      <p className="text-muted-foreground mb-6">Saisissez les détails du paiement ou scannez le QR code du marchand.</p>
      
      <Card>
        <CardHeader>
            <CardTitle>Détails de la transaction</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="recipientAlias"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Code ou Alias du marchand</FormLabel>
                        <FormControl>
                        <div className="flex gap-2">
                            <Input placeholder="Saisir le code ici" {...field} />
                             <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" size="icon">
                                        <QrCode />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md p-0">
                                    <DialogHeader className="p-4">
                                        <DialogTitle>Scanner le code QR du marchand</DialogTitle>
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
                        <FormLabel>Montant (Fcfa)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Raison (Optionnel)</FormLabel>
                        <FormControl>
                        <Textarea placeholder="ex: Achat de produits (max 140 caractères)" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Vérifier le paiement
                </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
      
      {securityAnalysis && paymentDetails && (
        <SecurityAssistantDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            analysis={securityAnalysis}
            onConfirm={handlePaymentConfirm}
            paymentDetails={paymentDetails}
        />
      )}
    </>
  );
}

