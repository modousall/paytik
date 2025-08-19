
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useBalance } from "@/hooks/use-balance";
import { useVirtualCard } from "@/hooks/use-virtual-card";
import { CreditCard, Wallet, PiggyBank, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { useVaults } from "@/hooks/use-vaults";
import { useTontine } from "@/hooks/use-tontine";

export default function BalanceCards() {
    const { balance } = useBalance();
    const { card } = useVirtualCard();
    const { vaults } = useVaults();
    const { tontines } = useTontine();

    const totalVaultsBalance = vaults.reduce((acc, vault) => acc + vault.balance, 0);
    // For tontines, we sum up the total pot of each tontine the user is in.
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
        <div className="mb-8 -mx-4">
            <Carousel opts={{
                align: "start",
                loop: false,
            }}
            className="w-full"
            >
                <CarouselContent className="-ml-2">
                    {cards.map((c, index) => (
                         <CarouselItem key={c.id} className="pl-4 basis-4/5 md:basis-1/3">
                            <Card
                                className={cn(
                                    "text-white shadow-lg h-40 flex flex-col justify-between p-4",
                                    c.color
                                )}
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
                         </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}
