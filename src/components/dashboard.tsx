"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, History, QrCode, User, SlidersHorizontal, LogOut } from "lucide-react";
import PaymentForm from './payment-form';
import TransactionHistory from './transaction-history';
import QrCodeDisplay from './qr-code-display';
import ManageAlias from './manage-alias';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


type DashboardTab = 'pay' | 'history' | 'qr' | 'manage';

type DashboardProps = {
  alias: string;
  onLogout: () => void;
};

const Header = ({ alias, onLogout }: { alias: string, onLogout: () => void; }) => (
    <header className="bg-card p-4 sm:p-6 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">PAYTIK</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{alias}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
);

export default function Dashboard({ alias, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('pay');

  const renderContent = () => {
    switch (activeTab) {
      case 'pay':
        return <PaymentForm />;
      case 'history':
        return <TransactionHistory />;
      case 'qr':
        return <QrCodeDisplay alias={alias} />;
      case 'manage':
        return <ManageAlias alias={alias} onLogout={onLogout} />;
      default:
        return <PaymentForm />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header alias={alias} onLogout={onLogout} />
      <div className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Menu</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button variant={activeTab === 'pay' ? 'secondary' : 'ghost'} className="justify-start text-base py-6" onClick={() => setActiveTab('pay')}><ArrowUpRight className="mr-2 h-5 w-5"/> Payer</Button>
                    <Button variant={activeTab === 'history' ? 'secondary' : 'ghost'} className="justify-start text-base py-6" onClick={() => setActiveTab('history')}><History className="mr-2 h-5 w-5"/> Historique</Button>
                    <Button variant={activeTab === 'qr' ? 'secondary' : 'ghost'} className="justify-start text-base py-6" onClick={() => setActiveTab('qr')}><QrCode className="mr-2 h-5 w-5"/> Mon QR</Button>
                    <Button variant={activeTab === 'manage' ? 'secondary' : 'ghost'} className="justify-start text-base py-6" onClick={() => setActiveTab('manage')}><SlidersHorizontal className="mr-2 h-5 w-5"/> Gérer l'alias</Button>
                </CardContent>
            </Card>
          </aside>
          <main className="lg:col-span-3">
            <Card className="shadow-sm min-h-[500px]">
                <CardContent className="p-6">
                    {renderContent()}
                </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
