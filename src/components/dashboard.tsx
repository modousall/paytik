
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

type UserInfo = {
    name: string;
    email: string;
};

type DashboardProps = {
  alias: string;
  userInfo: UserInfo;
  onLogout: () => void;
};

type View = 'dashboard' | 'profile';
type ActiveAction = 'none' | 'payer';
type ActiveService = 'ma-carte' | 'coffres' | 'tontine' | null;

export default function Dashboard({ alias, userInfo, onLogout }: DashboardProps) {
    const [view, setView] = useState<View>('dashboard');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [activeService, setActiveService] = useState<ActiveService>(null);
    const [activeAction, setActiveAction] = useState<ActiveAction>('none');

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
    
    const handleServiceNavigation = (service: ActiveService) => {
        setActiveService(service);
        setView('dashboard');
        setActiveAction('none');
    };

    const renderContent = () => {
        if(view === 'profile'){
            return <Profile userInfo={userInfo} alias={alias} onLogout={onLogout} onBack={() => onNavigateTo('dashboard')} />;
        }

        if (showAllTransactions) {
            return <TransactionHistory showAll={true} onShowAll={handleShowAllTransactions} />;
        }
        if (activeService) {
             switch (activeService) {
                case 'tontine':
                    return <Tontine onBack={() => setActiveService(null)}/>;
                case 'ma-carte':
                    return <VirtualCard onBack={() => setActiveService(null)}/>;
                case 'coffres':
                     return <Vaults onBack={() => setActiveService(null)} />;
                default:
                    setActiveService(null);
             }
        }
        if (activeAction === 'payer') {
            return <PayerTransferer onBack={() => setActiveAction('none')} />
        }
        
        return (
            <div className="space-y-8">
                <DashboardHeader userInfo={userInfo} alias={alias} onProfileClick={() => onNavigateTo('profile')} />
                <HomeActions 
                    onSendClick={() => setActiveAction('payer')} 
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
