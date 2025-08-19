
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Users, Bell, QrCode, Home, Handshake, User as UserIcon, LogOut } from "lucide-react";
import TransactionHistory from './transaction-history';
import QrCodeDisplay from './qr-code-display';
import PaymentForm from './payment-form';
import Profile from './profile';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import Tontine from './tontine';
import Services from './services';
import SplitBill from './split-bill';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

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

const Header = ({ userInfo, alias, onLogout }: { userInfo: UserInfo; alias: string, onLogout: () => void }) => (
    <header className="bg-background p-4 sm:p-6 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src={`https://i.pravatar.cc/150?u=${userInfo.email}`} alt={userInfo.name} data-ai-hint="person face" />
                <AvatarFallback>{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="font-bold text-lg text-primary">PAYTIK</div>
        </div>
        <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><QrCode /></Button>
              </SheetTrigger>
              <SheetContent className="p-0">
                  <QrCodeDisplay alias={alias} userInfo={userInfo} />
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon"><Bell /></Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <LogOut />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
                    <AlertDialogDescription>
                       Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à nouveau à votre compte.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={onLogout} className="bg-destructive hover:bg-destructive/90">
                        Se déconnecter
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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

const HomeActions = ({ onSendClick, onReceiveClick }: { onSendClick: () => void; onReceiveClick: () => void; }) => (
    <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="flex flex-col items-center gap-2">
            <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" onClick={onSendClick}><ArrowUp/></Button>
            <span className="text-sm font-medium">Envoyer</span>
        </div>
        <Sheet>
            <SheetTrigger asChild>
                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onReceiveClick}>
                    <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><ArrowDown/></Button>
                    <span className="text-sm font-medium">Recevoir</span>
                </div>
            </SheetTrigger>
            <SheetContent className="p-0">
                <QrCodeDisplay alias={"alias_placeholder"} userInfo={{name: "User", email: "email"}} />
            </SheetContent>
        </Sheet>
         <Dialog>
            <DialogTrigger asChild>
                <div className="flex flex-col items-center gap-2 cursor-pointer">
                    <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><Users/></Button>
                    <span className="text-sm font-medium">Partager</span>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Partager une dépense</DialogTitle>
                </DialogHeader>
                <SplitBill />
            </DialogContent>
        </Dialog>
    </div>
)


export default function Dashboard({ alias, userInfo, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<NavItem>('accueil');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [activeService, setActiveService] = useState<string | null>(null);

    const handleShowAllTransactions = (show: boolean) => {
        setShowAllTransactions(show);
    };
    
    const onTabClick = (tab: NavItem) => {
        setShowAllTransactions(false);
        setActiveService(null);
        setActiveTab(tab);
      }
    
      const handleServiceClick = (service: string) => {
        setActiveTab('services'); 
        setActiveService(service);
      }

      const renderContent = () => {
        if (showAllTransactions) {
            return <TransactionHistory showAll={true} onShowAll={() => handleShowAllTransactions(false)} />;
        }
        switch(activeTab){
            case 'accueil':
                return (
                    <div>
                        <BalanceDisplay />
                        <HomeActions 
                            onSendClick={() => onTabClick('payer')} 
                            onReceiveClick={() => { /* Sheet handles open */ }}
                        />
                        <TransactionHistory showAll={false} onShowAll={() => handleShowAllTransactions(true)} />
                    </div>
                )
            case 'payer':
                return <PaymentForm />;
            case 'services':
                 if (activeService === 'tontine') return <Tontine />;
                 // Add Ma Carte view here when ready
                 // if (activeService === 'ma-carte') return <MaCarteComponent />;
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
                        />
                        <TransactionHistory showAll={false} onShowAll={() => handleShowAllTransactions(true)} />
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
