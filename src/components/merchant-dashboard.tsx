
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users, Settings, BarChart3, Package, ArrowLeft, Landmark, ShoppingCart } from 'lucide-react';
import { useState } from "react";

type UserInfo = {
    name: string;
    email: string;
}

type MerchantDashboardProps = {
    onLogout: () => void;
    userInfo: UserInfo;
};

type MerchantView = 'dashboard' | 'sales' | 'terminals' | 'payouts';

const merchantFeatures: {id: MerchantView, title: string, description: string, icon: JSX.Element}[] = [
    { id: "sales", title: "Analyse des Ventes", description: "Consulter vos revenus et statistiques de ventes.", icon: <BarChart3 /> },
    { id: "terminals", title: "Gestion des Terminaux", description: "Visualiser et gérer vos points de vente.", icon: <ShoppingCart /> },
    { id: "payouts", title: "Versements", description: "Configurer et suivre les versements sur votre compte bancaire.", icon: <Landmark /> },
]

export default function MerchantDashboard({ onLogout, userInfo }: MerchantDashboardProps) {
    const [view, setView] = useState<MerchantView>('dashboard');

    const renderContent = () => {
        switch(view) {
            case 'sales':
            case 'terminals':
            case 'payouts':
                 return <div className="text-center p-8 bg-card rounded-lg"><p>Cette fonctionnalité est en cours de développement.</p></div>;
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {merchantFeatures.map(feature => (
                            <Card key={feature.title} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setView(feature.id)}>
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">{feature.icon}</div>
                                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
        }
    }

  return (
    <div className="min-h-screen bg-secondary">
        <header className="bg-background border-b shadow-sm">
            <div className="container mx-auto p-4 flex justify-between items-center">
                 <h1 className="text-xl font-bold text-primary">Backoffice Marchand</h1>
                 <Button variant="ghost" onClick={onLogout}>
                    <ArrowLeft className="mr-2" /> Retour à l'application
                </Button>
            </div>
        </header>
        
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                {view === 'dashboard' ? (
                     <>
                        <h2 className="text-3xl font-bold">Bienvenue, {userInfo.name} !</h2>
                        <p className="text-muted-foreground">Gérez votre activité commerciale depuis ce tableau de bord.</p>
                     </>
                ) : (
                    <Button variant="outline" onClick={() => setView('dashboard')}>
                        <ArrowLeft className="mr-2"/> Retour au tableau de bord
                    </Button>
                )}
            </div>
            {renderContent()}
        </main>
    </div>
  );
}
