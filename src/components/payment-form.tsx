
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
import { Loader2, Users, ClipboardPaste } from 'lucide-react';
import { useTransactions } from '@/hooks/use-transactions';
import SplitBill from './split-bill';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const paymentFormSchema = z.object({
  recipientAlias: z.string().min(1, { message: "L'alias du destinataire est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant doit être positif." }),
  reason: z.string().max(140).optional().default(''),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function PaymentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [securityAnalysis, setSecurityAnalysis] = useState<PaymentSecurityAssistantOutput | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentFormValues | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useTransactions();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      recipientAlias: "",
      amount: undefined,
      reason: "",
    },
  });

  async function onSubmit(values: PaymentFormValues) {
    setIsLoading(true);
    setPaymentDetails(values);
    try {
      const result = await paymentSecurityAssistant({
        recipientAlias: values.recipientAlias,
        recipientAccountDetails: 'N/A pour le paiement par alias',
        amount: values.amount,
        transactionType: 'Paiement par alias',
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
            reason: paymentDetails.reason || "Paiement",
            date: new Date().toISOString(),
            amount: paymentDetails.amount,
            status: "Terminé",
        });
        toast({
            title: "Paiement Envoyé!",
            description: `Envoyé avec succès ${paymentDetails.amount.toLocaleString()} Fcfa à ${paymentDetails.recipientAlias}.`,
        });
      }

      form.reset();
      setSecurityAnalysis(null);
      setPaymentDetails(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      form.setValue('recipientAlias', text, { shouldValidate: true });
      toast({ title: "Collé !", description: "L'alias a été collé depuis le presse-papiers." });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de lire le presse-papiers.", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary">Envoyer de l'argent</h2>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><Users className="mr-2"/> Partager une dépense</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Partager une dépense</DialogTitle>
                </DialogHeader>
                <SplitBill />
            </DialogContent>
        </Dialog>
      </div>

      <p className="text-muted-foreground mb-6">Saisissez les détails du paiement pour envoyer de l'argent via PAYTIK.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="recipientAlias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias du destinataire</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input placeholder="ex: +221771234567 ou nom du contact" {...field} />
                    <Button type="button" variant="outline" size="icon" onClick={handlePaste} aria-label="Coller l'alias">
                      <ClipboardPaste />
                    </Button>
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
                  <Textarea placeholder="ex: Argent pour le déjeuner (max 140 caractères)" {...field} />
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
