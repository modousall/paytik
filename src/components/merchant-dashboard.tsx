
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BarChart3, FileText, Landmark, QrCode } from 'lucide-react';
import QrCodeDisplay from './qr-code-display';
import { useBalance } from "@/hooks/use-balance";
import TransactionHistory from "./transaction-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useTransactions } from "@/hooks/use-transactions";
import { toast } from "@/hooks/use-toast";

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
                                <CardDescription>Le client scanne ce code pour vous payer.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6">
                                <div className="p-4 bg-white rounded-lg shadow-md">
                                    <QrCodeDisplay alias={alias} userInfo={userInfo} simpleMode={true} />
                                </div>
                                <div className="flex gap-4">
                                     <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handlePlaceholderClick("Demander un paiement")}>
                                        <FileText/> Demander un paiement
                                    </Button>
                                    <Button size="lg" variant="secondary" onClick={() => handlePlaceholderClick("Versements bancaires")}>
                                        <Landmark/> Versements
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="dashboard" className="mt-6 space-y-6">
                        <KPIs />
                        <Card>
                            <CardHeader>
                                <CardTitle>Historique des Encaissements</CardTitle>
                                <CardDescription>Liste de toutes les transactions reçues.</CardDescription>
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
