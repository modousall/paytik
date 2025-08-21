
"use client";

import { useMemo, useState } from 'react';
import { useFeatureFlags, type Feature } from '@/hooks/use-feature-flags';
import { useUserManagement } from '@/hooks/use-user-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { CreditCard, Users, Clock, PiggyBank, Wallet, Handshake, HandCoins } from 'lucide-react';
import AdminFeatureDetail from './admin-feature-detail';
import AdminBnplManagement from './admin-bnpl-management';
import { Button } from './ui/button';
import { useBnpl } from '@/hooks/use-bnpl';
import { formatCurrency } from '@/lib/utils';
import { useIslamicFinancing } from '@/hooks/use-islamic-financing';
import AdminProductManagement from './admin-product-management';

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
  const { kpis: bnplKpis } = useBnpl();
  const { allRequests: financingRequests } = useIslamicFinancing();

  const [activeView, setActiveView] = useState<'overview' | 'featureDetail' | 'bnplManagement' | 'billers'>('overview');
  const [selectedFeature, setSelectedFeature] = useState<Feature | 'mainBalance' | 'vaults' | null>(null);

  const kpis = useMemo(() => {
    const totalMainBalance = users.reduce((sum, user) => sum + user.balance, 0);
    const totalVirtualCardBalance = users.reduce((sum, user) => sum + (user.virtualCard?.balance || 0), 0);
    const totalVaultsBalance = users.reduce((sum, user) => sum + user.vaults.reduce((vaultSum, vault) => vaultSum + vault.balance, 0), 0);
    const totalTontineValue = users.reduce((sum, user) => sum + user.tontines.reduce((tontineSum, tontine) => tontineSum + (tontine.amount * tontine.participants.length), 0), 0);
    const totalApprovedFinancing = financingRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);
    
    return {
        mainBalance: totalMainBalance,
        virtualCards: totalVirtualCardBalance,
        vaults: totalVaultsBalance,
        tontine: totalTontineValue,
        islamicFinancing: totalApprovedFinancing,
    }
  }, [users, financingRequests]);
  
  const allProducts = [
    { featureKey: 'mainBalance', title: "Comptes Principaux", value: formatCurrency(kpis.mainBalance), icon: <Wallet/>, description: "Somme de tous les soldes principaux des utilisateurs." },
    { featureKey: 'vaults', title: "Coffres / Tirelires", value: formatCurrency(kpis.vaults), icon: <PiggyBank />, description: "Permettre aux utilisateurs de créer des coffres d'épargne. Essentiel et ne peut être désactivé." },
    { featureKey: 'virtualCards', title: "Cartes Virtuelles", value: formatCurrency(kpis.virtualCards), icon: <CreditCard/>, description: "Activer la création et l'utilisation de cartes virtuelles." },
    { featureKey: 'tontine', title: "Tontines", value: formatCurrency(kpis.tontine), icon: <Users/>, description: "Permettre la création et la participation à des groupes d'épargne." },
  ]

  const handleFeatureClick = (feature: Feature | 'mainBalance' | 'vaults') => {
      setSelectedFeature(feature);
      setActiveView('featureDetail');
  }

  const handleBackToOverview = () => {
      setActiveView('overview');
      setSelectedFeature(null);
  }

  if(activeView === 'featureDetail' && selectedFeature) {
      return <AdminFeatureDetail feature={selectedFeature as any} onBack={handleBackToOverview} />
  }

  if (activeView === 'bnplManagement') {
      return <AdminBnplManagement />
  }
  
  if (activeView === 'billers') {
      return <AdminProductManagement />
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Services</CardTitle>
          <CardDescription>
            Activez ou désactivez les fonctionnalités et cliquez sur une carte pour gérer le service correspondant.
          </CardDescription>
        </CardHeader>
      </Card>

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
                    onClick={() => handleFeatureClick(product.featureKey as any)}
                />
            )
        })}

        <Card className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('bnplManagement')}>
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                <div className="p-3 bg-primary/10 rounded-full text-primary"><Clock /></div>
                <CardTitle className="text-lg font-semibold">Credit Marchands</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-3xl font-bold">{formatCurrency(bnplKpis.totalApprovedAmount)}</p>
                 <p className="text-sm text-muted-foreground">Total des crédits approuvés</p>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 border-t pt-4">
                 <p className="text-xs text-muted-foreground">Gérer les demandes de paiement échelonné et activer ou désactiver la fonctionnalité.</p>
                 <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Switch
                        id="bnpl-switch"
                        checked={flags.bnpl}
                        onCheckedChange={(val) => setFlag('bnpl', val)}
                        aria-label="Activer ou désactiver le Credit Marchands"
                    />
                    <Label htmlFor="bnpl-switch" className="cursor-pointer">{flags.bnpl ? "Activé" : "Désactivé"}</Label>
                </div>
            </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                <div className="p-3 bg-primary/10 rounded-full text-primary"><HandCoins /></div>
                <CardTitle className="text-lg font-semibold">Financement Islamique</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-3xl font-bold">{formatCurrency(kpis.islamicFinancing)}</p>
                 <p className="text-sm text-muted-foreground">Total des financements approuvés</p>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 border-t pt-4">
                 <p className="text-xs text-muted-foreground">Activer ou désactiver le module de financement islamique pour les utilisateurs.</p>
                 <div className="flex items-center space-x-2">
                    <Switch
                        id="financing-switch"
                        checked={flags.islamicFinancing}
                        onCheckedChange={(val) => setFlag('islamicFinancing', val)}
                        aria-label="Activer ou désactiver le Financement Islamique"
                    />
                    <Label htmlFor="financing-switch" className="cursor-pointer">{flags.islamicFinancing ? "Activé" : "Désactivé"}</Label>
                </div>
            </CardFooter>
        </Card>

        <Card className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('billers')}>
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                <div className="p-3 bg-primary/10 rounded-full text-primary"><Handshake /></div>
                <CardTitle className="text-lg font-semibold">Gestion des Facturiers</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-3xl font-bold">&nbsp;</p> {/* Placeholder */}
                 <p className="text-sm text-muted-foreground">Configurez les services externes</p>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 border-t pt-4">
                 <p className="text-xs text-muted-foreground">Gérer les facturiers (Senelec, SDE) et les opérateurs Mobile Money (Wave, OM).</p>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
