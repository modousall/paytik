
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useBalance } from "@/hooks/use-balance";

export default function BalanceDisplay() {
    const { balance } = useBalance();
    return (
        <Card className="bg-card shadow-lg w-full max-w-sm mx-auto mb-6">
            <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Solde Principal</p>
                <p className="text-4xl font-bold tracking-tight">{balance.toLocaleString()} <span className="text-lg font-normal">Fcfa</span></p>
            </CardContent>
        </Card>
    );
}
