"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { PaymentSecurityAssistantOutput } from '@/ai/flows/payment-security-assistant';
import { AlertTriangle, ShieldCheck } from "lucide-react";

type SecurityAssistantDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: PaymentSecurityAssistantOutput;
  onConfirm: () => void;
  paymentDetails: { recipientAlias: string; amount: number; reason?: string };
};

export default function SecurityAssistantDialog({
  isOpen,
  onOpenChange,
  analysis,
  onConfirm,
  paymentDetails,
}: SecurityAssistantDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-2xl">
            {analysis.isHighRisk ? (
              <AlertTriangle className="text-destructive" />
            ) : (
              <ShieldCheck className="text-[hsl(var(--chart-2))]" />
            )}
            Confirm Payment
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please review the security analysis before confirming your payment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="text-sm space-y-4 py-4 border-y">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{paymentDetails.recipientAlias}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium text-lg text-primary">{paymentDetails.amount.toLocaleString()} XOF</span>
            </div>
            {paymentDetails.reason && (
                 <div className="flex justify-between items-start gap-4">
                    <span className="text-muted-foreground">Reason:</span>
                    <span className="font-medium text-right">{paymentDetails.reason}</span>
                </div>
            )}
        </div>

        <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
                {analysis.isHighRisk ? (
                    <Badge variant="destructive">High Risk</Badge>
                ) : (
                    <Badge variant="default" className="bg-[hsl(var(--chart-2))] hover:bg-[hsl(var(--chart-2))]">Low Risk</Badge>
                )}
                AI Security Suggestions
            </h4>
            <ul className="list-disc list-inside bg-secondary p-3 rounded-md text-secondary-foreground space-y-1 text-xs">
                {analysis.securitySuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                ))}
            </ul>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Confirm & Pay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
