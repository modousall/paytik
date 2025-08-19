
"use client";

import { useState } from 'react';
import { Home, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type NavItem = 'accueil' | 'profil';
type ActiveAction = 'none' | 'payer';

const servicesMap: { [key: string]: Service } = {
    "ma-carte": { name: "Ma Carte", icon: <></>, action: "ma-carte", description: "" },
    "coffres": { name: "Coffres", icon: <></>, action: "coffres", description: "" },
    "tontine": { name: "Tontine", icon: <></>, action: "tontine", description: "" },
}

export default function Dashboard({ alias, userInfo, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<NavItem>('accueil');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [activeService, setActiveService] = useState<Service | null>(null);
    const [activeAction, setActiveAction] = useState<ActiveAction>('none');

    const handleShowAllTransactions = (show: boolean) => {
        setShowAllTransactions(show);
    };
    
    const onTabClick = (tab: NavItem) => {
        setShowAllTransactions(false);
        setActiveService(null);
        setActiveAction('none');
        setActiveTab(tab);
    }
    
      const handleCardNavigation = (destination: 'transactions' | 'ma-carte' | 'coffres' | 'tontine') => {
        if (destination === 'transactions') {
            setShowAllTransactions(true);
            setActiveTab('accueil'); 
        } else {
            const service = servicesMap[destination];
            if (service) {
                setActiveService(service);
                setActiveTab('accueil');
                setActiveAction('none');
            }
        }
      };

      const renderContent = () => {
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
        
        switch(activeTab){
            case 'accueil':
                return (
                    <div className="space-y-8">
                        <DashboardHeader userInfo={userInfo} alias={alias} />
                        <HomeActions 
                            onSendClick={() => setActiveAction('payer')} 
                            alias={alias}
                            userInfo={userInfo}
                        />
                        <BalanceCards onNavigate={handleCardNavigation} />
                        <TransactionHistory showAll={false} onShowAll={handleShowAllTransactions} />
                    </div>
                )
            case 'profil':
                return <Profile userInfo={userInfo} alias={alias} onLogout={onLogout} />;
            default:
                 return (
                    <div className="space-y-8">
                        <DashboardHeader userInfo={userInfo} alias={alias} />
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
      }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow container mx-auto p-4 sm:p-6 pb-24">
            {renderContent()}
        </main>
      <footer className="fixed bottom-0 inset-x-0 z-40 flex justify-center p-4">
          <nav className="bg-background/95 backdrop-blur-sm shadow-lg border rounded-full grid grid-cols-2 gap-1 p-2 max-w-xs w-full">
            <Button onClick={() => onTabClick('accueil')} variant={activeTab === 'accueil' && !showAllTransactions && !activeService ? 'secondary' : 'ghost'} className="flex-col h-auto py-2 px-4 rounded-full">
                <Home />
                <span className="text-xs">Accueil</span>
            </Button>
            <Button onClick={() => onTabClick('profil')} variant={activeTab === 'profil' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2 px-4 rounded-full">
                <UserIcon />
                <span className="text-xs">Profil</span>
            </Button>
          </nav>
      </footer>
    </div>
  );
}
