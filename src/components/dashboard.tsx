
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
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { Button } from './ui/button';
import { LayoutDashboard } from 'lucide-react';
import AdminDashboard from './admin-dashboard';
import Settings from './settings';
import MerchantList from './merchant-list';
import Financing from './financing';
import PICASH from './picash';

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

type View = 'dashboard' | 'profile' | 'backoffice' | 'settings' | 'merchants';
type ActiveAction = 'none' | 'payer' | 'recharger' | 'retirer';
type ActiveService = 'ma-carte' | 'coffres' | 'tontine' | 'financement' | null;

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
        return null;
    }
    
    const renderContent = () => {
        if(view === 'profile'){
            return <Profile userInfo={userInfo} alias={alias} onLogout={onLogout} onBack={() => onNavigateTo('dashboard')} onNavigate={onNavigateTo} />;
        }
        if (view === 'settings') {
            return <Settings alias={alias} onBack={() => onNavigateTo('profile')} onLogout={onLogout} onNavigate={onNavigateTo} />;
        }
        if (view === 'merchants') {
            return <MerchantList onBack={() => onNavigateTo('settings')} />;
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
                    return <Tontine onBack={() => setActiveService(null)}/>;
                case 'ma-carte':
                    return <VirtualCard onBack={() => setActiveService(null)} cardHolderName={userInfo.name} />;
                case 'coffres':
                     return <Vaults onBack={() => setActiveService(null)} />;
                case 'financement':
                    return <Financing onBack={() => setActiveService(null)} />;
                default:
                    setActiveService(null);
             }
        }
        if (activeAction !== 'none') {
             switch (activeAction) {
                case 'payer':
                    return <PayerTransferer onBack={() => setActiveAction('none')} />
                case 'recharger':
                    return <RechargerCompte onBack={() => setActiveAction('none')} />
                case 'retirer':
                    return <PICASH onBack={() => setActiveAction('none')} />
                default:
                    setActiveAction('none');
            }
        }
        
        const isPrivilegedUser = ['admin', 'superadmin', 'support'].includes(userInfo.role);

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
                    onFinancingClick={() => setActiveService('financement')}
                    alias={alias}
                    userInfo={userInfo}
                />
                
                <BalanceCards onNavigate={handleCardNavigation} userInfo={userInfo} />
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
