
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ShieldCheck, UserCog, Building, User, Headset } from 'lucide-react';

const roles = [
    {
        name: "Super Admin",
        icon: <ShieldCheck className="h-8 w-8 text-destructive" />,
        description: "Contrôle total sur la plateforme, y compris la gestion des autres administrateurs.",
        permissions: ["Toutes les permissions"]
    },
    {
        name: "Admin",
        icon: <UserCog className="h-8 w-8 text-primary" />,
        description: "Gère les utilisateurs, supervise les transactions et configure les produits.",
        permissions: ["Gestion utilisateurs", "Analyse transactions", "Gestion produits"]
    },
    {
        name: "Support",
        icon: <Headset className="h-8 w-8 text-primary" />,
        description: "Assiste les utilisateurs, consulte les transactions et peut suspendre des comptes.",
        permissions: ["Consultation utilisateurs", "Consultation transactions", "Suspension utilisateurs"]
    },
    {
        name: "Marchand",
        icon: <Building className="h-8 w-8 text-primary" />,
        description: "Accepte les paiements, consulte son historique de ventes et demande des versements.",
        permissions: ["Recevoir paiements", "Voir ses transactions", "Demander versements"]
    },
    {
        name: "Utilisateur",
        icon: <User className="h-8 w-8 text-primary" />,
        description: "Utilisateur standard de l'application avec accès aux fonctionnalités de base.",
        permissions: ["Payer", "Recharger", "Gérer ses produits (coffres, etc.)"]
    },
];

export default function AdminRoleManagement() {
  return (
    <div>
        <CardHeader className="px-0">
            <CardTitle>Gestion des Rôles et Permissions</CardTitle>
            <CardDescription>
                Visualisez les différents rôles sur la plateforme. La modification des permissions sera bientôt disponible.
            </CardDescription>
        </CardHeader>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
                <Card key={role.name}>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            {role.icon}
                            <CardTitle className="text-xl">{role.name}</CardTitle>
                        </div>
                        <CardDescription className="pt-2">{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold mb-2 text-sm">Permissions clés :</h4>
                        <div className="flex flex-wrap gap-2">
                            {role.permissions.map(p => (
                                <span key={p} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
