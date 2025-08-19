
"use client";

import { useState } from 'react';
import { Home, ArrowUp, Handshake, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransactionHistory from './transaction-history';
import PaymentForm from './payment-form';
import Profile from './profile';
import Tontine from './tontine';
import Services from './services';
import VirtualCard from './virtual-card';
import HomeActions from './home-actions';
import BillPaymentForm from './bill-payment-form';
import type { Service } from './services';
import MerchantServices from './merchant-services';
import Vaults from './vaults';
import PICO from './pico';
import PICASH from './picash';
import BNPL from './bnpl';
import BalanceCards from './balance-cards';
import DashboardHeader from './dashboard-header';

type UserInfo = {
    name: string;
    email: string;
};

type DashboardProps = {
  alias: string;
  userInfo: UserInfo;
  onLogout: () => void;
};

type NavItem = 'accueil' | 'payer' | 'services' | 'profil';

const servicesMap: { [key: string]: Service } = {
    "ma-carte": { name: "Ma Carte", icon: <></>, action: "ma-carte", description: "" },
    "coffres": { name: "Coffres", icon: <></>, action: "coffres", description: "" },
    "tontine": { name: "Tontine", icon: <></>, action: "tontine", description: "" },
    "factures": { name: "Factures", icon: <></>, action: "factures", description: "" },
    "marchands": { name: "Marchands", icon: <></>, action: "marchands", description: "" },
}

export default function Dashboard({ alias, userInfo, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<NavItem>('accueil');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [activeService, setActiveService] = useState<Service | null>(null);
    const [activeMerchantService, setActiveMerchantService] = useState<string | null>(null);

    const handleShowAllTransactions = (show: boolean) => {
        setShowAllTransactions(show);
    };
    
    const onTabClick = (tab: NavItem) => {
        setShowAllTransactions(false);
        setActiveService(null);
        setActiveMerchantService(null);
        setActiveTab(tab);
      }
    
      const handleServiceClick = (service: Service) => {
        setActiveTab('services'); 
        setActiveService(service);
      }

      const backToServices = () => {
        setActiveService(null);
        setActiveMerchantService(null);
      }

      const handleMerchantServiceClick = (service: string) => {
        setActiveMerchantService(service);
      }

      const handleCardNavigation = (destination: string) => {
        if (destination === 'transactions') {
            setShowAllTransactions(true);
        } else {
            const service = servicesMap[destination];
            if (service) {
                setActiveTab('services');
                setActiveService(service);
            }
        }
      };

      const renderContent = () => {
        if (showAllTransactions) {
            return <TransactionHistory showAll={true} onShowAll={handleShowAllTransactions} />;
        }
        switch(activeTab){
            case 'accueil':
                return (
                    <div className="space-y-8">
                        <DashboardHeader userInfo={userInfo} alias={alias} />
                        <HomeActions 
                            onSendClick={() => onTabClick('payer')} 
                            alias={alias}
                            userInfo={userInfo}
                        />
                        <BalanceCards onNavigate={handleCardNavigation} />
                        <TransactionHistory showAll={false} onShowAll={handleShowAllTransactions} />
                    </div>
                )
            case 'payer':
                return <PaymentForm />;
            case 'services':
                 if (!activeService) return <Services onServiceClick={handleServiceClick}/>;
                 
                 if (activeService.action === 'marchands') {
                    if (activeMerchantService === 'pico') return <PICO onBack={() => setActiveMerchantService(null)} />;
                    if (activeMerchantService === 'picash') return <PICASH onBack={() => setActiveMerchantService(null)} />;
                    if (activeMerchantService === 'bnpl') return <BNPL onBack={() => setActiveMerchantService(null)} />;
                    return <MerchantServices onBack={backToServices} onServiceClick={handleMerchantServiceClick} />;
                 }

                 switch (activeService.action) {
                    case 'tontine':
                        return <Tontine onBack={backToServices}/>;
                    case 'ma-carte':
                        return <VirtualCard onBack={backToServices}/>;
                    case 'factures':
                        return <BillPaymentForm onBack={backToServices} />;
                    case 'coffres':
                         return <Vaults onBack={backToServices} />;
                    default:
                        return <Services onServiceClick={handleServiceClick}/>;
                 }
            case 'profil':
                return <Profile userInfo={userInfo} alias={alias} onLogout={onLogout} />;
            default:
                 return (
                    <div className="space-y-8">
                        <DashboardHeader userInfo={userInfo} alias={alias} />
                        <HomeActions 
                            onSendClick={() => onTabClick('payer')} 
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
          <nav className="bg-background/95 backdrop-blur-sm shadow-lg border rounded-full grid grid-cols-4 gap-1 p-2 max-w-sm w-full">
            <Button onClick={() => onTabClick('accueil')} variant={activeTab === 'accueil' && !showAllTransactions ? 'secondary' : 'ghost'} className="flex-col h-auto py-2 px-4 rounded-full">
                <Home />
                <span className="text-xs">Accueil</span>
            </Button>
            <Button onClick={() => onTabClick('payer')} variant={activeTab === 'payer' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2 px-4 rounded-full">
                <ArrowUp />
                <span className="text-xs">Payer</span>
            </Button>
            <Button onClick={() => onTabClick('services')} variant={activeTab === 'services' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2 px-4 rounded-full">
                <Handshake />
                <span className="text-xs">Services</span>
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
