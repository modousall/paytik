
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BarChart3, FileText, Landmark, QrCode, Loader2 } from 'lucide-react';
import QrCodeDisplay from './qr-code-display';
import { useBalance } from "@/hooks/use-balance";
import TransactionHistory from "./transaction-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useTransactions } from "@/hooks/use-transactions";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "./ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

type UserInfo = {
    name: string;
    email: string;
}

type MerchantDashboardProps = {
    onLogout: () => void;
    userInfo: UserInfo;
    alias: string;
};


const KPIs = () => {
    const { balance } = useBalance();
    const { transactions } = useTransactions();
    
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = transactions.filter(tx => tx.date.startsWith(today) && tx.type === 'received');
    const todaysRevenue = todaysTransactions.reduce((acc, tx) => acc + tx.amount, 0);

    const kpiData = [
        { title: "Chiffre d'affaires (Aujourd'hui)", value: `${todaysRevenue.toLocaleString()} Fcfa` },
        { title: "Transactions (Aujourd'hui)", value: todaysTransactions.length },
        { title: "Solde Marchand Actuel", value: `${balance.toLocaleString()} Fcfa` },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {kpiData.map(kpi => (
                <Card key={kpi.title}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const handlePlaceholderClick = (featureName: string) => {
    toast({
        title: "Fonctionnalité en cours de développement",
        description: `La fonctionnalité "${featureName}" sera bientôt disponible.`,
    });
};

const paymentRequestSchema = z.object({
    amount: z.coerce.number().positive("Le montant doit être positif."),
    reason: z.string().optional(),
});
type PaymentRequestValues = z.infer<typeof paymentRequestSchema>;

const RequestPaymentDialog = ({ alias, userInfo }: { alias: string, userInfo: UserInfo }) => {
    const [isRequestGenerated, setIsRequestGenerated] = useState(false);
    const [requestData, setRequestData] = useState<PaymentRequestValues | null>(null);

    const form = useForm<PaymentRequestValues>({
        resolver: zodResolver(paymentRequestSchema),
        defaultValues: { amount: undefined, reason: "" },
    });

    const onSubmit = (values: PaymentRequestValues) => {
        setRequestData(values);
        setIsRequestGenerated(true);
    };

    if (isRequestGenerated && requestData) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Demande de {requestData.amount.toLocaleString()} Fcfa</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-center text-muted-foreground mb-4">Le client doit scanner ce code pour payer le montant exact.</p>
                    <div className="p-4 bg-white rounded-lg shadow-md w-fit mx-auto">
                         <QrCodeDisplay
                            alias={alias}
                            userInfo={userInfo}
                            simpleMode={true}
                            amount={requestData.amount}
                            reason={requestData.reason}
                        />
                    </div>
                </div>
                 <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsRequestGenerated(false)}>Retour</Button>
                    <DialogClose asChild><Button>Terminé</Button></DialogClose>
                </div>
            </DialogContent>
        )
    }

    return (
        <DialogContent>
             <DialogHeader>
                <DialogTitle>Demander un paiement</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Montant (Fcfa)</FormLabel>
                                <FormControl><Input type="number" placeholder="ex: 1500" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Raison / Description (Optionnel)</FormLabel>
                                <FormControl><Input placeholder="ex: Facture #42" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
                        <Button type="submit">Générer le QR Code</Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    )
}

const PayoutDialog = () => {
    const { balance, debit } = useBalance();
    const { addTransaction } = useTransactions();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const payoutSchema = z.object({
        amount: z.coerce.number().positive("Le montant doit être positif.").max(balance, "Le solde est insuffisant."),
        iban: z.string().min(14, "L'IBAN est invalide.").regex(/^SN/, "L'IBAN doit commencer par SN."),
    });
    type PayoutValues = z.infer<typeof payoutSchema>;

     const form = useForm<PayoutValues>({
        resolver: zodResolver(payoutSchema),
        defaultValues: { amount: undefined, iban: "" },
    });

    const onSubmit = (values: PayoutValues) => {
        debit(values.amount);
        addTransaction({
            type: 'versement',
            counterparty: `Banque via IBAN ****${values.iban.slice(-4)}`,
            reason: "Versement des fonds",
            date: new Date().toISOString(),
            amount: values.amount,
            status: "En attente"
        });
        toast({
            title: "Demande de versement initiée",
            description: `Votre demande de versement de ${values.amount.toLocaleString()} Fcfa a été envoyée.`
        });
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Demande de versement enregistrée</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-center">
                    <p>Votre demande a été prise en compte et sera traitée dans les plus brefs délais.</p>
                </div>
                 <div className="flex justify-end gap-2">
                    <DialogClose asChild><Button>Fermer</Button></DialogClose>
                </div>
            </DialogContent>
        )
    }

    return (
         <DialogContent>
             <DialogHeader>
                <DialogTitle>Demander un versement bancaire</DialogTitle>
                <DialogDescription>Transférez les fonds de votre compte marchand vers votre compte bancaire.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Montant (Fcfa)</FormLabel>
                                <FormControl><Input type="number" placeholder="ex: 50000" {...field} /></FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground">Solde disponible: {balance.toLocaleString()} Fcfa</p>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="iban"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>IBAN du compte bancaire</FormLabel>
                                <FormControl><Input placeholder="SN00 XXXX XXXX XXXX XXXX XXX" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                            Confirmer le versement
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    )
}

export default function MerchantDashboard({ onLogout, userInfo, alias }: MerchantDashboardProps) {
    const [showAllTransactions, setShowAllTransactions] = useState(false);
  
    return (
        <div className="min-h-screen bg-secondary">
            <header className="bg-background border-b shadow-sm sticky top-0 z-10">
                <div className="container mx-auto p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">Tableau de Bord Marchand</h1>
                    <Button variant="outline" onClick={onLogout}>
                        <LogOut className="mr-2" /> Déconnexion
                    </Button>
                </div>
            </header>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                 <Tabs defaultValue="cash-in" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="cash-in" className="h-full text-base"><QrCode className="mr-2"/>Encaisser</TabsTrigger>
                        <TabsTrigger value="dashboard" className="h-full text-base"><BarChart3 className="mr-2"/>Tableau de Bord</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cash-in" className="mt-6">
                        <Card className="max-w-2xl mx-auto">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">Recevoir un Paiement</CardTitle>
                                <CardDescription>Le client scanne ce code pour vous payer un montant libre.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6">
                                <div className="p-4 bg-white rounded-lg shadow-md">
                                    <QrCodeDisplay alias={alias} userInfo={userInfo} simpleMode={true} />
                                </div>
                                <div className="flex gap-4">
                                     <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                                                <FileText/> Demander un paiement
                                            </Button>
                                        </DialogTrigger>
                                        <RequestPaymentDialog alias={alias} userInfo={userInfo} />
                                     </Dialog>
                                     <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="lg" variant="secondary">
                                                <Landmark/> Versements
                                            </Button>
                                        </DialogTrigger>
                                        <PayoutDialog />
                                     </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="dashboard" className="mt-6 space-y-6">
                        <KPIs />
                        <Card>
                            <CardHeader>
                                <CardTitle>Historique des Transactions</CardTitle>
                                <CardDescription>Liste de toutes les transactions sur votre compte marchand.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TransactionHistory showAll={true} onShowAll={() => {}} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
