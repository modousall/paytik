
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useBalance } from "@/hooks/use-balance";
import { useVirtualCard } from "@/hooks/use-virtual-card";
import { CreditCard, Wallet, PiggyBank, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVaults } from "@/hooks/use-vaults";
import { useTontine } from "@/hooks/use-tontine";

export default function BalanceCards() {
    const { balance } = useBalance();
    const { card } = useVirtualCard();
    const { vaults } = useVaults();
    const { tontines } = useTontine();
    const [activeIndex, setActiveIndex] = useState(0);

    const totalVaultsBalance = vaults.reduce((acc, vault) => acc + vault.balance, 0);
    const totalTontinesBalance = tontines.reduce((acc, tontine) => acc + (tontine.amount * tontine.participants.length), 0);

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
            color: 'bg-sky-500'
        }] : []),
        ...(totalVaultsBalance > 0 ? [{
            id: 'vaults' as const,
            title: 'Mes Coffres',
            balance: totalVaultsBalance,
            icon: <PiggyBank className="h-6 w-6" />,
            color: 'bg-amber-500'
        }] : []),
        ...(totalTontinesBalance > 0 ? [{
            id: 'tontines' as const,
            title: 'Mes Tontines',
            balance: totalTontinesBalance,
            icon: <Users className="h-6 w-6" />,
            color: 'bg-emerald-500'
        }] : [])
    ];
    
    const handleCardClick = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % cards.length);
    };

    return (
        <div className="relative h-48 mb-8 cursor-pointer" onClick={handleCardClick} title="Cliquez pour changer de solde">
            {cards.map((c, index) => {
                const position = (index - activeIndex + cards.length) % cards.length;
                return (
                    <Card
                        key={c.id}
                        className={cn(
                            "text-white shadow-lg h-40 flex flex-col justify-between p-4 absolute w-full transition-all duration-300 ease-in-out",
                            c.color
                        )}
                        style={{
                            transform: `translateY(${position * 10}px) scale(${1 - position * 0.05})`,
                            zIndex: cards.length - position,
                            opacity: position > 2 ? 0 : 1, // Hide cards that are too far back
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <p className="font-semibold">{c.title}</p>
                            {c.icon}
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold tracking-tight">{c.balance.toLocaleString()}</p>
                            <p className="text-sm opacity-80">Fcfa</p>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
