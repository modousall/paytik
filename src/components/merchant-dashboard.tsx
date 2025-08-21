
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BarChart3, FileText, Landmark, QrCode, ScanLine, Smartphone, Store, Calculator, Clock } from 'lucide-react';
import QrCodeDisplay from './qr-code-display';
import { useBalance } from "@/hooks/use-balance";
import TransactionHistory from "./transaction-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "./ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import QRCodeScanner from "./qr-code-scanner";
import { useProductManagement } from "@/hooks/use-product-management";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTransactions } from "@/hooks/use-transactions";
import { Html5Qrcode } from "html5-qrcode";
import AdminTegSimulator from "./admin-teg-simulator";
import MerchantCreditProposalForm from "./merchant-credit-proposal-form";

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
    const { mobileMoneyOperators } = useProductManagement();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedMessage, setSubmittedMessage] = useState("");

    const bankPayoutSchema = z.object({
        amount: z.coerce.number().positive("Le montant doit être positif.").max(balance, "Le solde est insuffisant."),
        iban: z.string().min(14, "L'IBAN est invalide.").regex(/^SN/, "L'IBAN doit commencer par SN."),
    });
    type BankPayoutValues = z.infer<typeof bankPayoutSchema>;

    const mobileMoneyPayoutSchema = z.object({
        amount: z.coerce.number().positive("Le montant doit être positif.").max(balance, "Le solde est insuffisant."),
        operator: z.string().min(1, "L'opérateur est requis."),
        phone: z.string().min(9, "Le numéro de téléphone est invalide."),
    });
    type MobileMoneyPayoutValues = z.infer<typeof mobileMoneyPayoutSchema>;
    
    const merchantPayoutSchema = z.object({
        amount: z.coerce.number().positive("Le montant doit être positif.").max(balance, "Le solde est insuffisant."),
        alias: z.string().min(3, "L'alias du marchand est invalide."),
    });
    type MerchantPayoutValues = z.infer<typeof merchantPayoutSchema>;

     const bankForm = useForm<BankPayoutValues>({
        resolver: zodResolver(bankPayoutSchema),
        defaultValues: { amount: undefined, iban: "" },
    });
     const mobileMoneyForm = useForm<MobileMoneyPayoutValues>({
        resolver: zodResolver(mobileMoneyPayoutSchema),
        defaultValues: { amount: undefined, operator: "", phone: "" },
    });
    const merchantForm = useForm<MerchantPayoutValues>({
        resolver: zodResolver(merchantPayoutSchema),
        defaultValues: { amount: undefined, alias: "" },
    });

    const handlePayout = (amount: number, reason: string, counterparty: string) => {
        debit(amount);
        addTransaction({
            type: 'versement',
            counterparty,
            reason,
            date: new Date().toISOString(),
            amount,
            status: "En attente"
        });
        setSubmittedMessage(`Votre demande de versement de ${amount.toLocaleString()} Fcfa a été envoyée.`);
        setIsSubmitted(true);
    };

    const onBankSubmit = (values: BankPayoutValues) => {
        handlePayout(values.amount, "Versement bancaire", `Banque via IBAN ****${values.iban.slice(-4)}`);
    };
    
    const onMobileMoneySubmit = (values: MobileMoneyPayoutValues) => {
        handlePayout(values.amount, `Versement vers ${values.operator}`, values.phone);
    };
    
    const onMerchantSubmit = (values: MerchantPayoutValues) => {
        handlePayout(values.amount, "Transfert entre marchands", values.alias);
    };

    if (isSubmitted) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Demande de versement enregistrée</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-center">
                    <p>{submittedMessage}</p>
                </div>
                 <div className="flex justify-end gap-2">
                    <DialogClose asChild><Button>Fermer</Button></DialogClose>
                </div>
            </DialogContent>
        )
    }

    return (
         <DialogContent className="max-w-lg">
             <DialogHeader>
                <DialogTitle>Demander un versement</DialogTitle>
                <DialogDescription>Transférez les fonds de votre compte marchand vers la destination de votre choix.</DialogDescription>
            </DialogHeader>
            <p className="text-sm font-medium">Solde disponible: <span className="text-primary">{balance.toLocaleString()} Fcfa</span></p>
            <Tabs defaultValue="bank">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="bank"><Landmark className="mr-2"/>Banque</TabsTrigger>
                    <TabsTrigger value="mobile-money"><Smartphone className="mr-2"/>Mobile Money</TabsTrigger>
                    <TabsTrigger value="merchant"><Store className="mr-2"/>Marchand</TabsTrigger>
                </TabsList>
                
                <TabsContent value="bank">
                    <Form {...bankForm}>
                        <form onSubmit={bankForm.handleSubmit(onBankSubmit)} className="space-y-4 pt-4">
                            <FormField control={bankForm.control} name="amount" render={({ field }) => (
                                <FormItem><FormLabel>Montant (Fcfa)</FormLabel><FormControl><Input type="number" placeholder="ex: 50000" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={bankForm.control} name="iban" render={({ field }) => (
                                <FormItem><FormLabel>IBAN du compte bancaire</FormLabel><FormControl><Input placeholder="SN00 XXXX XXXX XXXX XXXX XXX" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="flex justify-end gap-2 pt-4">
                                <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
                                <Button type="submit" disabled={bankForm.formState.isSubmitting}>Confirmer le versement</Button>
                            </div>
                        </form>
                    </Form>
                </TabsContent>

                <TabsContent value="mobile-money">
                     <Form {...mobileMoneyForm}>
                        <form onSubmit={mobileMoneyForm.handleSubmit(onMobileMoneySubmit)} className="space-y-4 pt-4">
                            <FormField control={mobileMoneyForm.control} name="amount" render={({ field }) => (
                                <FormItem><FormLabel>Montant (Fcfa)</FormLabel><FormControl><Input type="number" placeholder="ex: 10000" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={mobileMoneyForm.control} name="operator" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Opérateur Mobile Money</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez un opérateur" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {mobileMoneyOperators.map(op => (<SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={mobileMoneyForm.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Numéro de téléphone</FormLabel><FormControl><Input placeholder="+221 7X XXX XX XX" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="flex justify-end gap-2 pt-4">
                                <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
                                <Button type="submit" disabled={mobileMoneyForm.formState.isSubmitting}>Confirmer le versement</Button>
                            </div>
                        </form>
                    </Form>
                </TabsContent>

                <TabsContent value="merchant">
                    <Form {...merchantForm}>
                        <form onSubmit={merchantForm.handleSubmit(onMerchantSubmit)} className="space-y-4 pt-4">
                            <FormField control={merchantForm.control} name="amount" render={({ field }) => (
                                <FormItem><FormLabel>Montant (Fcfa)</FormLabel><FormControl><Input type="number" placeholder="ex: 25000" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={merchantForm.control} name="alias" render={({ field }) => (
                                <FormItem><FormLabel>Alias du marchand destinataire</FormLabel><FormControl><Input placeholder="aliasMarchand123" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="flex justify-end gap-2 pt-4">
                                <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
                                <Button type="submit" disabled={merchantForm.formState.isSubmitting}>Confirmer le transfert</Button>
                            </div>
                        </form>
                    </Form>
                </TabsContent>
            </Tabs>
        </DialogContent>
    )
}

export default function MerchantDashboard({ onLogout, userInfo, alias }: MerchantDashboardProps) {
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);

    const handleScannedCode = (decodedText: string) => {
        setIsScannerOpen(false);
        try {
            const data = JSON.parse(decodedText);
            if (data.shid) {
                toast({ 
                    title: "Code Client Scanné !", 
                    description: `Alias du client: ${data.shid}. Prêt pour un remboursement ou un transfert.` 
                });
            } else {
                 toast({ 
                    title: "QR Code Invalide", 
                    description: "Ce code ne semble pas être un code client PAYTIK valide.", 
                    variant: "destructive" 
                });
            }
        } catch(e) {
            toast({ 
                title: "QR Code Invalide", 
                description: "Ce code ne semble pas être un code client PAYTIK valide.", 
                variant: "destructive" 
            });
        }
    }
  
    return (
        <div className="min-h-screen bg-secondary">
            <header className="bg-background border-b shadow-sm sticky top-0 z-10">
                <div className="container mx-auto p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">Tableau de Bord Marchand</h1>
                    <div className="flex items-center gap-2">
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="secondary">
                                    <Calculator className="mr-2"/> Simulateur TEG
                                </Button>
                            </DialogTrigger>
                            <AdminTegSimulator />
                        </Dialog>
                        <Button variant="outline" onClick={onLogout}>
                            <LogOut className="mr-2" /> Déconnexion
                        </Button>
                    </div>
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
                                <CardDescription>Le client scanne votre code. Cliquez sur le code pour scanner celui du client.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6">
                                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                                    <DialogTrigger asChild>
                                        <div className="p-4 bg-white rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform">
                                            <QrCodeDisplay alias={alias} userInfo={userInfo} simpleMode={true} />
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md p-0">
                                        <DialogHeader className="p-4">
                                            <DialogTitle>Scanner le code QR du client</DialogTitle>
                                        </DialogHeader>
                                        <QRCodeScanner onScan={handleScannedCode}/>
                                    </DialogContent>
                                </Dialog>

                                <div className="flex flex-col sm:flex-row gap-4">
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
                                      <Dialog open={isProposalFormOpen} onOpenChange={setIsProposalFormOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="lg" variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700">
                                                <Clock/> Proposer un Crédit
                                            </Button>
                                        </DialogTrigger>
                                        <MerchantCreditProposalForm 
                                            merchantAlias={alias}
                                            merchantInfo={userInfo}
                                            onClose={() => setIsProposalFormOpen(false)}
                                        />
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
