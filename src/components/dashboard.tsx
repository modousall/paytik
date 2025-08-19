"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Users, KeyRound, LogOut, Search, Bell, QrCode, Home, Settings } from "lucide-react";
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

type DashboardProps = {
  alias: string;
  onLogout: () => void;
};

type NavItem = 'accueil' | 'envoyer' | 'contacts' | 'alias';

const Header = ({ alias }: { alias: string }) => (
    <header className="bg-background p-4 sm:p-6 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person face" />
                <AvatarFallback>U</AvatarFallback>
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
                  <QrCodeDisplay alias={alias} />
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

const Accueil = ({onSendClick}: {onSendClick: () => void}) => (
    <div>
        <BalanceDisplay />
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center gap-2">
                <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" onClick={onSendClick}><ArrowUp/></Button>
                <span className="text-sm font-medium">Envoyer</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><ArrowDown/></Button>
                    </SheetTrigger>
                    <SheetContent>
                        <QrCodeDisplay alias="MyAlias" />
                    </SheetContent>
                </Sheet>
                <span className="text-sm font-medium">Recevoir</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" disabled><Settings/></Button>
                <span className="text-sm font-medium">Services</span>
            </div>
        </div>
        <TransactionHistory />
    </div>
);


export default function Dashboard({ alias, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<NavItem>('accueil');

    const renderContent = () => {
        switch(activeTab) {
            case 'accueil':
                return <Accueil onSendClick={() => setActiveTab('envoyer')} />;
            case 'envoyer':
                return <PaymentForm />;
            case 'contacts':
                return <Contacts />;
            case 'alias':
                return <ManageAlias alias={alias} onLogout={onLogout} />;
            default:
                return <Accueil onSendClick={() => setActiveTab('envoyer')} />;
        }
    }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header alias={alias} />
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        {renderContent()}
      </main>
      <footer className="bg-background p-2 border-t mt-auto sticky bottom-0">
          <div className="container mx-auto grid grid-cols-5 gap-1">
            <Button onClick={() => setActiveTab('accueil')} variant={activeTab === 'accueil' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2">
                <Home />
                <span className="text-xs">Accueil</span>
            </Button>
            <Button onClick={() => setActiveTab('envoyer')} variant={activeTab === 'envoyer' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2">
                <ArrowUp />
                <span className="text-xs">Envoyer</span>
            </Button>
            <Button onClick={() => setActiveTab('contacts')} variant={activeTab === 'contacts' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2">
                <Users />
                <span className="text-xs">Contacts</span>
            </Button>
            <Button onClick={() => setActiveTab('alias')} variant={activeTab === 'alias' ? 'secondary' : 'ghost'} className="flex-col h-auto py-2">
                <KeyRound />
                <span className="text-xs">Alias</span>
            </Button>
            <Button onClick={onLogout} variant="ghost" className="flex-col h-auto py-2 text-destructive hover:text-destructive">
                <LogOut />
                <span className="text-xs">Quitter</span>
            </Button>
          </div>
      </footer>
    </div>
  );
}
