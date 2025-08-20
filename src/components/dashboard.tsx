
"use client";

import { useState } from 'react';
import TransactionHistory from './transaction-history';
import Profile from './profile';
import Tontine from './tontine';
import VirtualCard from './virtual-card';
import HomeActions from './home-actions';
import type { Service } from './services';
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

const servicesMap: { [key: string]: Service } = {
    "ma-carte": { name: "Ma Carte", icon: <></>, action: "ma-carte", description: "" },
    "coffres": { name: "Coffres", icon: <></>, action: "coffres", description: "" },
    "tontine": { name: "Tontine", icon: <></>, action: "tontine", description: "" },
}

export default function Dashboard({ alias, userInfo, onLogout }: DashboardProps) {
    const [view, setView] = useState<View>('dashboard');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [activeService, setActiveService] = useState<Service | null>(null);
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
        } else {
            const service = servicesMap[destination];
            if (service) {
                setActiveService(service);
                setView('dashboard');
                setActiveAction('none');
            }
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
             switch (activeService.action) {
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
