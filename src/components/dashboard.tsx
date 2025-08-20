
"use client";

import { useState } from 'react';
import TransactionHistory from './transaction-history';
import Profile from './profile';
import Tontine from './tontine';
import VirtualCard from './virtual-card';
import HomeActions from './home-actions';
import Vaults from './vaults';
import BalanceCards from './balance-cards';
import DashboardHeader from './dashboard-header';
import PayerTransferer from './payer-transferer';
import RechargerCompte from './recharger-compte';
import PICASH from './picash';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { Button } from './ui/button';
import { LayoutDashboard } from 'lucide-react';
import AdminDashboard from './admin-dashboard';
import MerchantDashboard from './merchant-dashboard';

type UserInfo = {
    name: string;
    email: string;
    role: 'user' | 'merchant' | 'admin' | 'superadmin' | 'support';
};

type DashboardProps = {
  alias: string;
  userInfo: UserInfo;
  onLogout: () => void;
};

type View = 'dashboard' | 'profile' | 'backoffice';
type ActiveAction = 'none' | 'payer' | 'recharger' | 'retirer';
type ActiveService = 'ma-carte' | 'coffres' | 'tontine' | null;

export default function Dashboard({ alias, userInfo, onLogout }: DashboardProps) {
    const [view, setView] = useState<View>('dashboard');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [activeService, setActiveService] = useState<ActiveService>(null);
    const [activeAction, setActiveAction] = useState<ActiveAction>('none');
    const { flags } = useFeatureFlags();

    const handleShowAllTransactions = (show: boolean) => {
        setShowAllTransactions(show);
    };
    
    const onNavigateTo = (newView: View) => {
        setShowAllTransactions(false);
        setActiveService(null);
        setActiveAction('none');
        setView(newView);
    }
    
    const handleCardNavigation = (destination: 'transactions' | ActiveService) => {
        if (destination === 'transactions') {
            setShowAllTransactions(true);
            setView('dashboard'); 
            setActiveService(null);
            setActiveAction('none');
        } else {
            setActiveService(destination as ActiveService);
            setView('dashboard');
            setActiveAction('none');
        }
    };

    const renderBackoffice = () => {
        if(userInfo.role === 'admin' || userInfo.role === 'superadmin' || userInfo.role === 'support') {
            return <AdminDashboard onExit={() => onNavigateTo('dashboard')} />
        }
        if(userInfo.role === 'merchant') {
            return <MerchantDashboard userInfo={userInfo} onLogout={() => onNavigateTo('dashboard')} />
        }
        return null;
    }
    
    const renderContent = () => {
        if(view === 'profile'){
            return <Profile userInfo={userInfo} alias={alias} onLogout={onLogout} onBack={() => onNavigateTo('dashboard')} />;
        }
        if(view === 'backoffice') {
            return renderBackoffice();
        }

        if (showAllTransactions) {
            return <TransactionHistory showAll={true} onShowAll={handleShowAllTransactions} />;
        }
        if (activeService) {
             switch (activeService) {
                case 'tontine':
                    return flags.tontine ? <Tontine onBack={() => setActiveService(null)}/> : null;
                case 'ma-carte':
                    return flags.virtualCards ? <VirtualCard onBack={() => setActiveService(null)}/> : null;
                case 'coffres':
                     return <Vaults onBack={() => setActiveService(null)} />;
                default:
                    setActiveService(null);
             }
        }
        if (activeAction === 'payer') {
            return <PayerTransferer onBack={() => setActiveAction('none')} />
        }
        if (activeAction === 'recharger') {
            return <RechargerCompte onBack={() => setActiveAction('none')} />
        }
        if (activeAction === 'retirer') {
            return <PICASH onBack={() => setActiveAction('none')} />
        }
        
        const isPrivilegedUser = userInfo.role !== 'user';

        return (
            <div className="space-y-8">
                <DashboardHeader userInfo={userInfo} alias={alias} onProfileClick={() => onNavigateTo('profile')} />
                
                {isPrivilegedUser && (
                    <div className="text-center">
                         <Button onClick={() => onNavigateTo('backoffice')}>
                            <LayoutDashboard className="mr-2"/> Accéder au Backoffice
                         </Button>
                    </div>
                )}
                
                <HomeActions 
                    onSendClick={() => setActiveAction('payer')} 
                    onRechargeClick={() => setActiveAction('recharger')}
                    onWithdrawClick={() => setActiveAction('retirer')}
                    alias={alias}
                    userInfo={userInfo}
                />
                <BalanceCards onNavigate={handleCardNavigation} />
                <TransactionHistory showAll={false} onShowAll={handleShowAllTransactions} />
            </div>
        )
      }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow container mx-auto p-4 sm:p-6">
            {renderContent()}
        </main>
    </div>
  );
}
