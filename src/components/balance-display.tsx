
"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function BalanceDisplay() {
    return (
        <Card className="bg-card shadow-lg w-full max-w-sm mx-auto mb-6">
            <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Solde</p>
                <p className="text-4xl font-bold tracking-tight">22 017 800 <span className="text-lg font-normal">Fcfa</span></p>
            </CardContent>
        </Card>
    );
}
