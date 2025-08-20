
"use client";

import { Card } from "@/components/ui/card";
import { useBalance } from "@/hooks/use-balance";
import { useVirtualCard } from "@/hooks/use-virtual-card";

export default function BalanceDisplay() {
    const { balance } = useBalance();
    const { card } = useVirtualCard();
    return (
        <div className="mb-6 space-y-4">
            <Card className="bg-card shadow-lg w-full max-w-sm mx-auto p-6 text-center">
                <p className="text-sm text-muted-foreground">Solde Principal</p>
                <p className="text-4xl font-bold tracking-tight">{balance.toLocaleString()} <span className="text-lg font-normal">Fcfa</span></p>
            </Card>
            {card && (
                <Card className="bg-card shadow-lg w-full max-w-sm mx-auto p-4 text-center">
                    <p className="text-sm text-muted-foreground">Solde Carte Virtuelle</p>
                    <p className="text-2xl font-bold tracking-tight">{(card.balance || 0).toLocaleString()} <span className="text-base font-normal">Fcfa</span></p>
                </Card>
            )}
        </div>
    );
}
