
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BarChart3, FileText, Landmark, QrCode, ScanLine, Smartphone, Store, Clock } from 'lucide-react';
import QrCodeDisplay from './qr-code-display';
import { useBalance } from "@/hooks/use-balance";
import TransactionHistory from "./transaction-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "./ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { useProductManagement } from "@/hooks/use-product-management";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTransactions } from "@/hooks/use-transactions";
import MerchantCreditProposalForm from "./merchant-credit-proposal-form";
import PICASH from "./picash";
import HomeActions from "./home-actions";

type UserInfo = {
    name: string;
    email: string;
    role: 'user' | 'merchant' | 'admin' | 'superadmin' | 'support';
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

export default function MerchantDashboard({ onLogout, userInfo, alias }: MerchantDashboardProps) {
    const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);
    const [activeAction, setActiveAction] = useState<'none' | 'retirer'>('none');
  
    if(activeAction === 'retirer') {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <PICASH onBack={() => setActiveAction('none')} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-secondary">
            <header className="bg-background border-b shadow-sm sticky top-0 z-10">
                <div className="container mx-auto p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">Tableau de Bord Marchand</h1>
                    <div className="flex items-center gap-2">
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
                                <CardDescription>Présentez votre code au client ou demandez-lui un paiement.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6">
                                <div className="p-4 bg-white rounded-lg shadow-md">
                                    <QrCodeDisplay alias={alias} userInfo={userInfo} simpleMode={true} />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                     <HomeActions 
                                        onSendClick={() => {}} // N/A for merchant
                                        onRechargeClick={() => {}} // N/A for merchant
                                        onWithdrawClick={() => setActiveAction('retirer')}
                                        alias={alias}
                                        userInfo={userInfo}
                                     />
                                      <Dialog open={isProposalFormOpen} onOpenChange={setIsProposalFormOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="lg" variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700 h-20 sm:h-16 w-full flex-col gap-1">
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
