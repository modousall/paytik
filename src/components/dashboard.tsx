"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, MoreHorizontal, LogOut, User, Search, Bell, QrCode } from "lucide-react";
import TransactionHistory from './transaction-history';
import QrCodeDisplay from './qr-code-display';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"


type DashboardProps = {
  alias: string;
  onLogout: () => void;
};

const Header = ({ alias, onLogout }: { alias: string, onLogout: () => void; }) => (
    <header className="bg-background p-4 sm:p-6">
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

const ActionButtons = () => (
    <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="flex flex-col items-center gap-2">
            <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><ArrowUp/></Button>
            <span className="text-sm font-medium">Envoyer</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><ArrowDown/></Button>
            <span className="text-sm font-medium">Recevoir</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><MoreHorizontal/></Button>
            <span className="text-sm font-medium">Plus</span>
        </div>
    </div>
);


export default function Dashboard({ alias, onLogout }: DashboardProps) {

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header alias={alias} onLogout={onLogout} />
      <main className="flex-grow container mx-auto p-4">
        <Tabs defaultValue="compte" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="compte">Compte</TabsTrigger>
                <TabsTrigger value="abonnements" disabled>Abonnements</TabsTrigger>
                <TabsTrigger value="economies" disabled>Economies</TabsTrigger>
            </TabsList>
            <TabsContent value="compte">
                <BalanceDisplay />
                <ActionButtons />
                <TransactionHistory />
            </TabsContent>
        </Tabs>
      </main>
      <footer className="bg-background p-2 border-t mt-auto">
          <Button onClick={onLogout} variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2"/> Se déconnecter
          </Button>
      </footer>
    </div>
  );
}
