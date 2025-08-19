
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useBalance } from "@/hooks/use-balance";
import { useVirtualCard } from "@/hooks/use-virtual-card";
import { CreditCard, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export default function BalanceCards() {
    const { balance } = useBalance();
    const { card } = useVirtualCard();
    const [activeCard, setActiveCard] = useState<'main' | 'virtual'>('main');

    const cards = [
        {
            id: 'main',
            title: 'Solde Principal',
            balance: balance,
            icon: <Wallet className="h-6 w-6" />,
            color: 'bg-primary'
        },
        ...(card ? [{
            id: 'virtual' as const,
            title: 'Carte Virtuelle',
            balance: card.balance,
            icon: <CreditCard className="h-6 w-6" />,
            color: 'bg-accent'
        }] : [])
    ];

    const totalBalance = cards.reduce((acc, curr) => acc + curr.balance, 0);

    return (
        <div className="mb-8">
             <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Solde Total</p>
                <p className="text-2xl font-bold tracking-tight">{totalBalance.toLocaleString()} <span className="text-lg font-normal">Fcfa</span></p>
            </div>
            <div className="relative h-48 flex items-center justify-center">
                {cards.map((c, index) => (
                    <Card 
                        key={c.id}
                        onClick={() => setActiveCard(c.id as 'main' | 'virtual')}
                        className={cn(
                            "absolute w-10/12 text-white shadow-lg transition-all duration-300 ease-in-out cursor-pointer",
                            c.color,
                            activeCard === c.id 
                                ? 'z-10 transform scale-105' 
                                : `z-0 transform scale-0.95 ${index === 0 ? '-translate-x-4' : 'translate-x-4'} opacity-70`
                        )}
                    >
                        <CardContent className="p-4 flex flex-col justify-between h-36">
                           <div className="flex justify-between items-start">
                                <p className="font-semibold">{c.title}</p>
                                {c.icon}
                           </div>
                           <div className="text-right">
                                <p className="text-3xl font-bold tracking-tight">{c.balance.toLocaleString()}</p>
                                <p className="text-sm opacity-80">Fcfa</p>
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
