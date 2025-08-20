
"use client";

import { useMemo } from 'react';
import { useFeatureFlags, type Feature } from '@/hooks/use-feature-flags';
import { useUserManagement } from '@/hooks/use-user-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { CreditCard, Users, Clock, PiggyBank } from 'lucide-react';

const featureDetails: Record<Feature, { name: string; icon: JSX.Element; description: string }> = {
    virtualCards: { name: 'Cartes Virtuelles', icon: <CreditCard />, description: "Activer la création et l'utilisation de cartes de paiement virtuelles." },
    tontine: { name: 'Tontines', icon: <Users />, description: "Permettre la création et la participation à des groupes d'épargne." },
    bnpl: { name: 'Payer Plus Tard (BNPL)', icon: <Clock />, description: "Donner accès aux options de paiement échelonné chez les marchands." },
};

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString()} Fcfa`;

const KPICard = ({ title, value, icon, isEnabled, onToggle, description, featureKey }: { title: string, value: string, icon: JSX.Element, isEnabled: boolean, onToggle: (feature: Feature, value: boolean) => void, description: string, featureKey?: Feature }) => (
    <Card className="flex flex-col">
        <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">{icon}</div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">Total des actifs sur la plateforme</p>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 border-t pt-4">
             <p className="text-xs text-muted-foreground">{description}</p>
             <div className="flex items-center space-x-2">
                <Switch
                    id={featureKey}
                    checked={isEnabled}
                    onCheckedChange={(val) => featureKey && onToggle(featureKey, val)}
                    aria-label={`Activer ou désactiver ${title}`}
                    disabled={!featureKey}
                />
                <Label htmlFor={featureKey} className={!featureKey ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}>{isEnabled ? "Activé" : "Désactivé"}</Label>
            </div>
        </CardFooter>
    </Card>
);

export default function AdminFeatureManagement() {
  const { flags, setFlag } = useFeatureFlags();
  const { users } = useUserManagement();

  const kpis = useMemo(() => {
    const totalVirtualCardBalance = users.reduce((sum, user) => sum + (user.virtualCard?.balance || 0), 0);
    const totalVaultsBalance = users.reduce((sum, user) => sum + user.vaults.reduce((vaultSum, vault) => vaultSum + vault.balance, 0), 0);
    const totalTontineValue = users.reduce((sum, user) => sum + user.tontines.reduce((tontineSum, tontine) => tontineSum + (tontine.amount * tontine.participants.length), 0), 0);
    
    return {
        virtualCards: totalVirtualCardBalance,
        vaults: totalVaultsBalance,
        tontine: totalTontineValue,
        bnpl: 0 // BNPL is a service, not an asset with a balance
    }
  }, [users]);
  
  const allProducts = [
    { featureKey: 'virtualCards', title: "Cartes Virtuelles", value: formatCurrency(kpis.virtualCards), icon: <CreditCard/> },
    { featureKey: 'tontine', title: "Tontines", value: formatCurrency(kpis.tontine), icon: <Users/> },
    { featureKey: 'bnpl', title: "BNPL", value: "N/A", icon: <Clock/> },
  ]

  return (
    <div>
      <CardHeader className="px-0">
        <CardTitle>Gestion des Produits et Services</CardTitle>
        <CardDescription>
          Activez ou désactivez les fonctionnalités principales de l'application et visualisez leur utilisation globale.
        </CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard 
            title="Coffres / Tirelires"
            value={formatCurrency(kpis.vaults)}
            icon={<PiggyBank />}
            isEnabled={true}
            onToggle={() => {}} // No-op, always enabled
            description="Permettre aux utilisateurs de créer des coffres d'épargne personnels. Cette fonctionnalité est essentielle et ne peut être désactivée."
        />

        {allProducts.map(product => {
            const featureKey = product.featureKey as Feature;
            const details = featureDetails[featureKey];
            if(!details) return null;

            return (
                <KPICard 
                    key={featureKey}
                    title={details.name}
                    value={product.value}
                    icon={details.icon}
                    isEnabled={flags[featureKey]}
                    onToggle={setFlag}
                    description={details.description}
                    featureKey={featureKey}
                />
            )
        })}

      </div>
    </div>
  );
}
