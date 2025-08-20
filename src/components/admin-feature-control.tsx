
"use client";

import { useFeatureFlags, Feature } from '@/hooks/use-feature-flags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Users, Clock } from 'lucide-react';

const featureDetails: Record<Feature, { name: string; description: string; icon: JSX.Element }> = {
    virtualCards: {
        name: "Cartes Virtuelles",
        description: "Permet aux utilisateurs de créer et gérer des cartes de paiement virtuelles.",
        icon: <CreditCard className="text-primary" />
    },
    tontine: {
        name: "Tontines / Cagnottes",
        description: "Permet aux utilisateurs de créer et participer à des groupes d'épargne collectifs.",
        icon: <Users className="text-primary" />
    },
    bnpl: {
        name: "BNPL (Acheter maintenant, Payer plus tard)",
        description: "Permet aux utilisateurs de faire des demandes de paiement échelonné.",
        icon: <Clock className="text-primary" />
    }
};

export default function AdminFeatureControl() {
    const { flags, toggleFlag } = useFeatureFlags();

    const handleToggle = (flag: Feature) => {
        toggleFlag(flag);
        toast({
            title: "Configuration mise à jour",
            description: `La fonctionnalité "${featureDetails[flag].name}" est maintenant ${!flags[flag] ? 'activée' : 'désactivée'}.`
        })
    }

    if (!flags) {
        return <div>Chargement de la configuration des fonctionnalités...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contrôle des Fonctionnalités</CardTitle>
                <CardDescription>Activez ou désactivez des fonctionnalités majeures pour tous les utilisateurs de l'application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {(Object.keys(flags) as Feature[]).map((key) => (
                    <div key={key} className="flex items-start justify-between rounded-lg border p-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">{featureDetails[key].icon}</div>
                            <div className='space-y-0.5'>
                                <Label htmlFor={`feature-${key}`} className="text-base font-medium">
                                    {featureDetails[key].name}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {featureDetails[key].description}
                                </p>
                            </div>
                        </div>
                        <Switch
                            id={`feature-${key}`}
                            checked={flags[key]}
                            onCheckedChange={() => handleToggle(key)}
                        />
                    </div>
               ))}
            </CardContent>
        </Card>
    );
}
