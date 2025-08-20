
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users, Settings, BarChart3, ShieldCheck, Package } from 'lucide-react';

type AdminDashboardProps = {
    onExit: () => void;
};

const adminFeatures = [
    { title: "Gestion des utilisateurs", description: "Consulter, modifier ou suspendre des comptes.", icon: <Users /> },
    { title: "Analyse des transactions", description: "Visualiser les statistiques et les flux financiers.", icon: <BarChart3 /> },
    { title: "Contrôle des services", description: "Activer ou désactiver des fonctionnalités pour tous.", icon: <Settings /> },
    { title: "Rôles et Permissions", description: "Gérer les niveaux d'accès administratifs.", icon: <ShieldCheck /> },
    { title: "Produits et Tarification", description: "Configurer les produits et les frais de service.", icon: <Package /> },
]

export default function AdminDashboard({ onExit }: AdminDashboardProps) {

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
                <h2 className="text-3xl font-bold">Bienvenue, Admin !</h2>
                <p className="text-muted-foreground">Pilotez et contrôlez la plateforme PAYTIK depuis ce tableau de bord.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminFeatures.map(feature => (
                    <Card key={feature.title} className="hover:shadow-lg transition-shadow">
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
        </main>
    </div>
  );
}
