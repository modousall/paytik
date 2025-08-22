

"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import RecurringPaymentForm from "./recurring-payment-form";
import RecurringPaymentsList from "./recurring-payments-list";

type RecurringPaymentsProps = {
    onBack: () => void;
}

export default function RecurringPayments({ onBack }: RecurringPaymentsProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} variant="ghost" size="icon">
                        <ArrowLeft />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Paiements Récurrents</h2>
                        <p className="text-muted-foreground">Gérez vos paiements et abonnements programmés.</p>
                    </div>
                </div>
                 <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Programmer un paiement
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Programmer un nouveau paiement récurrent</DialogTitle>
                            <DialogDescription>
                                Le montant sera prélevé de votre solde principal à la fréquence choisie.
                            </DialogDescription>
                        </DialogHeader>
                        <RecurringPaymentForm onPaymentCreated={() => setIsCreateDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>
            
            <RecurringPaymentsList />
        </div>
    );
}
