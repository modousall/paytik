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
import { Loader2 } from 'lucide-react';

const paymentFormSchema = z.object({
  recipientAlias: z.string().min(1, { message: "Recipient alias is required." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  reason: z.string().max(140).optional().default(''),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function PaymentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [securityAnalysis, setSecurityAnalysis] = useState<PaymentSecurityAssistantOutput | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentFormValues | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
        recipientAccountDetails: 'N/A for alias payment',
        amount: values.amount,
        transactionType: 'Alias Payment',
      });
      setSecurityAnalysis(result);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("AI security check failed:", error);
      toast({
        title: "Error",
        description: "Could not perform security check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handlePaymentConfirm = () => {
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Payment Sent!",
        description: `Successfully sent ${paymentDetails?.amount.toLocaleString()} XOF to ${paymentDetails?.recipientAlias}.`,
      });
      setSecurityAnalysis(null);
      setPaymentDetails(null);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-primary">Send Money</h2>
      <p className="text-muted-foreground mb-6">Enter payment details to send money via PAYTIK.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="recipientAlias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Alias</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., +221771234567" {...field} />
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
                <FormLabel>Amount (XOF)</FormLabel>
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
                <FormLabel>Reason (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Lunch money (max 140 chars)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Review Payment
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
