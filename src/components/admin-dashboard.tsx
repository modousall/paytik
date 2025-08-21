
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Users, BarChart3, ShieldCheck, Blocks, ArrowLeft, Building, HandCoins } from 'lucide-react';
import AdminUserManagement from "./admin-user-management";
import AdminTransactionAnalysis from "./admin-transaction-analysis";
import AdminRoleManagement from "./admin-role-management";
import AdminFeatureManagement from "./admin-feature-management";
import AdminMerchantManagement from "./admin-merchant-management";
import AdminFinancingHub from "./admin-financing-hub";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type AdminDashboardProps = {
    onExit: () => void;
};

type AdminView = 'dashboard' | 'users' | 'merchants' | 'transactions' | 'roles' | 'services' | 'financing';

const adminFeatures: {id: AdminView, title: string, description: string, icon: JSX.Element}[] = [
    { id: "users", title: "Gestion des Utilisateurs", description: "Consulter, modifier et gérer les clients particuliers.", icon: <Users /> },
    { id: "merchants", title: "Gestion des Marchands", description: "Gérer les comptes et les profils des marchands.", icon: <Building /> },
    { id: "transactions", title: "Centre d'Analyse", description: "Visualiser les statistiques, les flux et exporter les données.", icon: <BarChart3 /> },
    { id: "financing", title: "Gestion des Financements", description: "Examiner les demandes de crédit et de financement.", icon: <HandCoins /> },
    { id: "services", title: "Gestion des Services", description: "Configurer les fonctionnalités et les facturiers.", icon: <Blocks /> },
    { id: "roles", title: "Rôles et Permissions", description: "Gérer les niveaux d'accès administratifs.", icon: <ShieldCheck /> },
]

export default function AdminDashboard({ onExit }: AdminDashboardProps) {
    const [view, setView] = useState<AdminView>('dashboard');

    const renderContent = () => {
        switch(view) {
            case 'users':
                return <AdminUserManagement />;
            case 'merchants':
                return <AdminMerchantManagement />;
            case 'transactions':
                return <AdminTransactionAnalysis />;
            case 'financing':
                return <AdminFinancingHub />;
            case 'services':
                return <AdminFeatureManagement />;
            case 'roles':
                 return <AdminRoleManagement />;
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {adminFeatures.map(feature => (
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
                 <h1 className="text-xl font-bold text-primary">Backoffice Super Admin</h1>
                 <Button variant="ghost" onClick={onExit}>
                    <LogOut className="mr-2" /> Quitter le mode admin
                </Button>
            </div>
        </header>
        
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                {view === 'dashboard' ? (
                     <>
                        <h2 className="text-3xl font-bold">Bienvenue, Admin !</h2>
                        <p className="text-muted-foreground">Pilotez et contrôlez la plateforme Midi depuis ce tableau de bord.</p>
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
