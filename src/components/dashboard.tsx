
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

const servicesMap: { [key: string]: { name: string; action: 'ma-carte' | 'coffres' | 'tontine' } } = {
    "ma-carte": { name: "Ma Carte", action: "ma-carte" },
    "coffres": { name: "Coffres", action: "coffres" },
    "tontine": { name: "Tontine", action: "tontine" },
}

export default function Dashboard({ alias, userInfo, onLogout }: DashboardProps) {
    const [view, setView] = 'dashboard');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [activeService, setActiveService] = useState<'ma-carte' | 'coffres' | 'tontine' | null>(null);
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
    
      const handleCardNavigation = (destination: 'transactions' | 'ma-carte' | 'coffres' | 'tontine') => {
        if (destination === 'transactions') {
            setShowAllTransactions(true);
            setView('dashboard'); 
            setActiveService(null);
            setActiveAction('none');
        } else {
            setActiveService(destination);
            setView('dashboard');
            setActiveAction('none');
        }
      };

      const renderContent = () => {
        if(view === 'profile'){
            return <Profile userInfo={userInfo} alias={alias} onLogout={onLogout} onBack={() => onNavigateTo('dashboard')} />;
        }

        // Dashboard view and its sub-states
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
                    setActiveService(null); // Fallback to reset state
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
