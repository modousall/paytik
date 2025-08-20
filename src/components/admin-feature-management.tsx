
"use client";

import { useMemo, useState } from 'react';
import { useFeatureFlags, type Feature } from '@/hooks/use-feature-flags';
import { useUserManagement } from '@/hooks/use-user-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { CreditCard, Users, Clock, PiggyBank, Wallet } from 'lucide-react';
import AdminFeatureDetail from './admin-feature-detail';

const featureDetails: Record<Feature, { name: string; icon: JSX.Element; description: string }> = {
    virtualCards: { name: 'Cartes Virtuelles', icon: <CreditCard />, description: "Activer la création et l'utilisation de cartes de paiement virtuelles." },
    tontine: { name: 'Tontines', icon: <Users />, description: "Permettre la création et la participation à des groupes d'épargne." },
    bnpl: { name: 'Payer Plus Tard (BNPL)', icon: <Clock />, description: "Donner accès aux options de paiement échelonné chez les marchands." },
};

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString()} Fcfa`;

const KPICard = ({ title, value, icon, isEnabled, onToggle, description, featureKey, onClick }: { title: string, value: string, icon: JSX.Element, isEnabled?: boolean, onToggle?: (feature: Feature, value: boolean) => void, description: string, featureKey?: Feature, onClick?: () => void }) => (
    <Card className={`flex flex-col ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
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
             {isEnabled !== undefined && onToggle && featureKey && (
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
            )}
        </CardFooter>
    </Card>
);

export default function AdminFeatureManagement() {
  const { flags, setFlag } = useFeatureFlags();
  const { users } = useUserManagement();
  const [selectedFeature, setSelectedFeature] = useState<Feature | 'mainBalance' | 'vaults' | null>(null);

  const kpis = useMemo(() => {
    const totalMainBalance = users.reduce((sum, user) => sum + user.balance, 0);
    const totalVirtualCardBalance = users.reduce((sum, user) => sum + (user.virtualCard?.balance || 0), 0);
    const totalVaultsBalance = users.reduce((sum, user) => sum + user.vaults.reduce((vaultSum, vault) => vaultSum + vault.balance, 0), 0);
    const totalTontineValue = users.reduce((sum, user) => sum + user.tontines.reduce((tontineSum, tontine) => tontineSum + (tontine.amount * tontine.participants.length), 0), 0);
    
    return {
        mainBalance: totalMainBalance,
        virtualCards: totalVirtualCardBalance,
        vaults: totalVaultsBalance,
        tontine: totalTontineValue,
        bnpl: 0 // BNPL is a service, not an asset with a balance
    }
  }, [users]);
  
  const allProducts = [
    { featureKey: 'mainBalance', title: "Comptes Principaux", value: formatCurrency(kpis.mainBalance), icon: <Wallet/>, description: "Somme de tous les soldes principaux des utilisateurs." },
    { featureKey: 'vaults', title: "Coffres / Tirelires", value: formatCurrency(kpis.vaults), icon: <PiggyBank />, description: "Permettre aux utilisateurs de créer des coffres d'épargne. Essentiel et ne peut être désactivé." },
    { featureKey: 'virtualCards', title: "Cartes Virtuelles", value: formatCurrency(kpis.virtualCards), icon: <CreditCard/>, description: "Activer la création et l'utilisation de cartes virtuelles." },
    { featureKey: 'tontine', title: "Tontines", value: formatCurrency(kpis.tontine), icon: <Users/>, description: "Permettre la création et la participation à des groupes d'épargne." },
    { featureKey: 'bnpl', title: "BNPL", value: "N/A", icon: <Clock/>, description: "Donner accès aux options de paiement échelonné." },
  ]

  if(selectedFeature) {
      return <AdminFeatureDetail feature={selectedFeature} onBack={() => setSelectedFeature(null)} />
  }

  return (
    <div>
      <CardHeader className="px-0">
        <CardTitle>Gestion des Produits et Services</CardTitle>
        <CardDescription>
          Activez ou désactivez les fonctionnalités principales de l'application et visualisez leur utilisation globale. Cliquez sur une carte pour voir les détails.
        </CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {allProducts.map(product => {
            const featureKey = product.featureKey as Feature;
            
            return (
                <KPICard 
                    key={product.featureKey}
                    title={product.title}
                    value={product.value}
                    icon={product.icon}
                    description={product.description}
                    isEnabled={flags[featureKey]}
                    onToggle={setFlag}
                    featureKey={featureKey}
                    onClick={product.featureKey === 'bnpl' ? undefined : () => setSelectedFeature(product.featureKey as any)}
                />
            )
        })}
      </div>
    </div>
  );
}
