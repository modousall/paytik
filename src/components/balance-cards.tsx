
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useBalance } from "@/hooks/use-balance";
import { useVirtualCard } from "@/hooks/use-virtual-card";
import { CreditCard, Wallet, PiggyBank, Users } from 'lucide-react';
import { useVaults } from "@/hooks/use-vaults";
import { useTontine } from "@/hooks/use-tontine";

type BalanceCardsProps = {
    onNavigate: (destination: 'transactions' | 'ma-carte' | 'coffres' | 'tontine') => void;
}

export default function BalanceCards({ onNavigate }: BalanceCardsProps) {
    const { balance } = useBalance();
    const { card } = useVirtualCard();
    const { vaults } = useVaults();
    const { tontines } = useTontine();

    const totalVaultsBalance = vaults.reduce((acc, vault) => acc + vault.balance, 0);
    const totalTontinesBalance = tontines.reduce((acc, tontine) => acc + (tontine.amount * tontine.participants.length), 0);

    const cardsData = [
        {
            id: 'transactions' as const,
            title: 'Solde Principal',
            balance: balance,
            icon: <Wallet className="h-6 w-6 text-white" />,
            color: 'from-primary to-blue-400'
        },
        {
            id: 'ma-carte' as const,
            title: 'Carte Virtuelle',
            balance: card?.balance ?? 0,
            icon: <CreditCard className="h-6 w-6 text-white" />,
            color: 'from-sky-500 to-cyan-400'
        },
        {
            id: 'coffres' as const,
            title: 'Mes Coffres',
            balance: totalVaultsBalance,
            icon: <PiggyBank className="h-6 w-6 text-white" />,
            color: 'from-amber-500 to-yellow-400'
        },
        {
            id: 'tontine' as const,
            title: 'Mes Tontines',
            balance: totalTontinesBalance,
            icon: <Users className="h-6 w-6 text-white" />,
            color: 'from-emerald-500 to-green-400'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {cardsData.map((c) => (
                <Card
                    key={c.id}
                    className={`text-white shadow-lg p-4 flex flex-col justify-between bg-gradient-to-br ${c.color} border-none cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out`}
                    onClick={() => onNavigate(c.id)}
                >
                    <div className="flex justify-between items-start">
                        <p className="font-semibold">{c.title}</p>
                        {c.icon}
                    </div>
                    <div className="text-right mt-4">
                        <p className="text-2xl font-bold tracking-tight">{c.balance.toLocaleString()}</p>
                        <p className="text-sm opacity-80">Fcfa</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
