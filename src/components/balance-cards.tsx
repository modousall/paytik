
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useBalance } from "@/hooks/use-balance";
import { useVirtualCard } from "@/hooks/use-virtual-card";
import { CreditCard, Wallet, PiggyBank, Users } from 'lucide-react';
import { useVaults } from "@/hooks/use-vaults";
import { useTontine } from "@/hooks/use-tontine";

export default function BalanceCards() {
    const { balance } = useBalance();
    const { card } = useVirtualCard();
    const { vaults } = useVaults();
    const { tontines } = useTontine();

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {cards.map((c) => (
                <Card
                    key={c.id}
                    className={`text-white shadow-lg p-4 flex flex-col justify-between ${c.color}`}
                >
                    <div className="flex justify-between items-start">
                        <p className="font-semibold">{c.title}</p>
                        {c.icon}
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold tracking-tight">{c.balance.toLocaleString()}</p>
                        <p className="text-sm opacity-80">Fcfa</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
