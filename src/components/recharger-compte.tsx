
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Smartphone, ChevronRight } from 'lucide-react';
import MobileMoneyRechargeForm from './mobile-money-recharge-form';
import BankCardRechargeForm from './bank-card-recharge-form';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

type RechargerCompteProps = {
    onBack: () => void;
}

type View = 'menu' | 'mobile-money' | 'bank-card';

const FeatureCard = ({ title, description, icon, onClick, colorClass }: { title: string, description: string, icon: JSX.Element, onClick: () => void, colorClass: string }) => (
    <Card 
        onClick={onClick}
        className="w-full cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
    >
        <CardContent className="p-4 flex items-center gap-4">
            <div className={cn("p-3 rounded-full", colorClass)}>
                {React.cloneElement(icon, { className: "h-6 w-6 text-white"})}
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
    </Card>
);

export default function RechargerCompte({ onBack }: RechargerCompteProps) {
  const [view, setView] = useState<View>('menu');

  const menuItems = [
    { id: 'mobile-money', title: "Mobile Money", description: "Depuis un compte Wave, Orange Money, etc.", icon: <Smartphone />, colorClass: "bg-orange-500" },
    { id: 'bank-card', title: "Carte Bancaire", description: "Avec une carte de débit ou de crédit.", icon: <CreditCard />, colorClass: "bg-blue-500" },
  ];

  if (view !== 'menu') {
    return (
      <Card>
        {view === 'mobile-money' && <MobileMoneyRechargeForm onRechargeSuccess={onBack} />}
        {view === 'bank-card' && <BankCardRechargeForm onRechargeSuccess={onBack} />}
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft />
        </Button>
         <div>
            <h2 className="text-2xl font-bold text-primary">Dépôt</h2>
             <p className="text-muted-foreground">Comment souhaitez-vous approvisionner votre compte ?</p>
        </div>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto'>
        {menuItems.map(item => (
            <FeatureCard 
                key={item.id}
                {...item}
                onClick={() => setView(item.id as View)}
            />
        ))}
      </div>
    </div>
  );
}
