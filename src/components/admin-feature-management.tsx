
"use client";

import { useFeatureFlags, type Feature } from '@/hooks/use-feature-flags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { CreditCard, Users, Clock } from 'lucide-react';

const featureDetails: Record<Feature, { name: string; icon: JSX.Element; description: string }> = {
    virtualCards: { name: 'Cartes Virtuelles', icon: <CreditCard />, description: "Activer la création et l'utilisation de cartes de paiement virtuelles." },
    tontine: { name: 'Tontines', icon: <Users />, description: "Permettre la création et la participation à des groupes d'épargne." },
    bnpl: { name: 'Payer Plus Tard (BNPL)', icon: <Clock />, description: "Donner accès aux options de paiement échelonné chez les marchands." },
};

export default function AdminFeatureManagement() {
  const { flags, setFlag } = useFeatureFlags();

  return (
    <div>
      <CardHeader className="px-0">
        <CardTitle>Gestion des Produits et Services</CardTitle>
        <CardDescription>
          Activez ou désactivez les fonctionnalités principales de l'application pour tous les utilisateurs.
        </CardDescription>
      </CardHeader>
      <div className="space-y-4">
        {Object.entries(flags).map(([key, isEnabled]) => {
          const featureKey = key as Feature;
          const details = featureDetails[featureKey];
          if (!details) return null;

          return (
            <Card key={featureKey}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    {details.icon}
                  </div>
                  <div>
                    <Label htmlFor={featureKey} className="text-lg font-semibold cursor-pointer">{details.name}</Label>
                    <p className="text-sm text-muted-foreground">{details.description}</p>
                  </div>
                </div>
                <Switch
                  id={featureKey}
                  checked={isEnabled}
                  onCheckedChange={(value) => setFlag(featureKey, value)}
                  aria-label={`Activer ou désactiver ${details.name}`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

    