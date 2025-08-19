
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
import Header from './header';
import BalanceDisplay from './balance-display';
import HomeActions from './home-actions';
import BillPaymentForm from './bill-payment-form';
import type { Service } from './services';
import MerchantServices from './merchant-services';

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

export default function Dashboard({ alias, userInfo, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<NavItem>('accueil');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [activeService, setActiveService] = useState<Service | null>(null);

    const handleShowAllTransactions = (show: boolean) => {
        setShowAllTransactions(show);
    };
    
    const onTabClick = (tab: NavItem) => {
        setShowAllTransactions(false);
        setActiveService(null);
        setActiveTab(tab);
      }
    
      const handleServiceClick = (service: Service) => {
        setActiveTab('services'); 
        setActiveService(service);
      }

      const backToServices = () => {
        setActiveService(null);
      }

      const renderContent = () => {
        if (showAllTransactions) {
            return <TransactionHistory showAll={true} onShowAll={handleShowAllTransactions} />;
        }
        switch(activeTab){
            case 'accueil':
                return (
                    <div>
                        <BalanceDisplay />
                        <HomeActions 
                            onSendClick={() => onTabClick('payer')} 
                            alias={alias}
                            userInfo={userInfo}
                        />
                        <TransactionHistory showAll={false} onShowAll={handleShowAllTransactions} />
                    </div>
                )
            case 'payer':
                return <PaymentForm />;
            case 'services':
                 if (!activeService) return <Services onServiceClick={handleServiceClick}/>;
                 
                 switch (activeService.action) {
                    case 'tontine':
                        return <Tontine onBack={backToServices}/>;
                    case 'ma-carte':
                        return <VirtualCard onBack={backToServices}/>;
                    case 'factures':
                        return <BillPaymentForm onBack={backToServices} />;
                    case 'marchands':
                        return <MerchantServices onBack={backToServices} />;
                    case 'coffres':
                         return (
                            <div className="text-center py-10">
                                <h2 className="text-2xl font-bold">Coffres / Tirelires</h2>
                                <p className="text-muted-foreground">Bientôt disponible.</p>
                                <Button onClick={backToServices} className="mt-4">Retour</Button>
                            </div>
                        );
                    default:
                        return <Services onServiceClick={handleServiceClick}/>;
                 }
            case 'profil':
                return <Profile alias={alias} onLogout={onLogout} />;
            default:
                 return (
                    <div>
                        <BalanceDisplay />
                        <HomeActions 
                            onSendClick={() => onTabClick('payer')} 
                            alias={alias}
                            userInfo={userInfo}
                        />
                        <TransactionHistory showAll={false} onShowAll={handleShowAllTransactions} />
                    </div>
                )

        }
      }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
        <Header userInfo={userInfo} alias={alias} onLogout={onLogout} />
        <main className="flex-grow container mx-auto p-4 sm:p-6">
            {renderContent()}
        </main>
      <footer className="bg-background p-2 border-t mt-auto sticky bottom-0">
          <div className="container mx-auto grid grid-cols-4 gap-1">
            <Button onClick={() => onTabClick('accueil')} variant={activeTab === 'accueil' && !showAllTransactions ? 'secondary' : 'ghost'} className="flex-col h-auto py-2">
                <Home />
                <span className="text-xs">Accueil</span>
            </Button>
            <Button onClick={() => onTabClick('payer')} variant={activeTab === 'payer' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2">
                <ArrowUp />
                <span className="text-xs">Payer</span>
            </Button>
            <Button onClick={() => onTabClick('services')} variant={activeTab === 'services' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2">
                <Handshake />
                <span className="text-xs">Services</span>
            </Button>
            <Button onClick={() => onTabClick('profil')} variant={activeTab === 'profil' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2">
                <UserIcon />
                <span className="text-xs">Profil</span>
            </Button>
          </div>
      </footer>
    </div>
  );
}
