
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Users, KeyRound, LogOut, Search, Bell, QrCode, Home, Settings, Landmark, LayoutGrid, Handshake, User as UserIcon } from "lucide-react";
import TransactionHistory from './transaction-history';
import QrCodeDisplay from './qr-code-display';
import PaymentForm from './payment-form';
import Contacts from './contacts';
import ManageAlias from './manage-alias';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Tontine from './tontine';
import Services from './services';
import Profile from './profile';

type UserInfo = {
    name: string;
    email: string;
};

type DashboardProps = {
  alias: string;
  userInfo: UserInfo;
  onLogout: () => void;
};

type NavItem = 'accueil' | 'payer' | 'tontine' | 'profil';

const Header = ({ userInfo }: { userInfo: UserInfo }) => (
    <header className="bg-background p-4 sm:p-6 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt={userInfo.name} data-ai-hint="person face" />
                <AvatarFallback>{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="font-bold text-lg text-primary">PAYTIK</div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Search /></Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><QrCode /></Button>
              </SheetTrigger>
              <SheetContent>
                  <QrCodeDisplay alias={userInfo.name} userInfo={userInfo} />
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon"><Bell /></Button>
        </div>
      </div>
    </header>
);

const BalanceDisplay = () => (
    <Card className="bg-card shadow-lg w-full max-w-sm mx-auto mb-6">
        <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Solde</p>
            <p className="text-4xl font-bold tracking-tight">22 017 800 <span className="text-lg font-normal">Fcfa</span></p>
        </CardContent>
    </Card>
);

const HomeActions = ({ onSendClick, onReceiveClick, onServicesClick }: { onSendClick: () => void; onReceiveClick: () => void; onServicesClick: () => void; }) => (
    <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="flex flex-col items-center gap-2">
            <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" onClick={onSendClick}><ArrowUp/></Button>
            <span className="text-sm font-medium">Envoyer</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" onClick={onReceiveClick}><ArrowDown/></Button>
                </SheetTrigger>
                <SheetContent>
                    <QrCodeDisplay alias={onReceiveClick.toString()} userInfo={{name: "User", email: "email"}} />
                </SheetContent>
            </Sheet>
            <span className="text-sm font-medium">Recevoir</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" onClick={onServicesClick}><LayoutGrid/></Button>
            <span className="text-sm font-medium">Services</span>
        </div>
    </div>
)


export default function Dashboard({ alias, userInfo, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<NavItem>('accueil');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [activeService, setActiveService] = useState<string | null>(null);

    const handleShowAllTransactions = () => {
        setShowAllTransactions(true);
    };
    
    const onTabClick = (tab: NavItem) => {
        setShowAllTransactions(false);
        setActiveService(null);
        setActiveTab(tab);
      }
    
      const handleServiceClick = (service: string) => {
        setActiveTab('tontine'); // A bit of a hack to show a service page, might need better routing
        setActiveService(service);
      }

      const renderContent = () => {
        if (showAllTransactions) {
            return <TransactionHistory showAll={true} onShowAll={() => setShowAllTransactions(false)} />;
        }
        switch(activeTab){
            case 'accueil':
                return (
                    <div>
                        <BalanceDisplay />
                        <HomeActions 
                            onSendClick={() => onTabClick('payer')} 
                            onReceiveClick={() => {
                                const sheetTrigger = document.querySelector('[aria-controls="radix-"]') as HTMLButtonElement | null;
                                if (sheetTrigger) sheetTrigger.click();
                            }}
                            onServicesClick={() => handleServiceClick("grid")}
                        />
                        <TransactionHistory showAll={false} onShowAll={handleShowAllTransactions} />
                    </div>
                )
            case 'payer':
                return <PaymentForm />;
            case 'tontine':
                 if (activeService === 'tontine') return <Tontine />;
                 if (activeService === 'grid') return <Services onServiceClick={handleServiceClick}/>;
                 // Add Ma Carte view here when ready
                 // if (activeService === 'Ma Carte') return <MaCarteComponent />;
                 // Default to something or show a message
                 return <Services onServiceClick={handleServiceClick}/>;
            case 'profil':
                return <Profile alias={alias} onLogout={onLogout} />;
            default:
                 return (
                    <div>
                        <BalanceDisplay />
                        <HomeActions 
                            onSendClick={() => onTabClick('payer')} 
                            onReceiveClick={() => {}}
                            onServicesClick={() => handleServiceClick("grid")}
                        />
                        <TransactionHistory showAll={false} onShowAll={handleShowAllTransactions} />
                    </div>
                )

        }
      }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header userInfo={userInfo} />
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
            <Button onClick={() => handleServiceClick('tontine')} variant={activeTab === 'tontine' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2">
                <Handshake />
                <span className="text-xs">Tontine</span>
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
