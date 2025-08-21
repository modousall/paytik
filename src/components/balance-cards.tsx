
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useBalance } from "@/hooks/use-balance";
import { useVirtualCard } from "@/hooks/use-virtual-card";
import { CreditCard, Wallet, PiggyBank, Users, Info } from 'lucide-react';
import { useVaults } from "@/hooks/use-vaults";
import { useTontine } from "@/hooks/use-tontine";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { useBnpl } from "@/hooks/use-bnpl";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type UserInfo = {
    role: 'user' | 'merchant' | 'admin' | 'superadmin' | 'support';
};

type BalanceCardsProps = {
    onNavigate: (destination: 'transactions' | 'ma-carte' | 'coffres' | 'tontine') => void;
    userInfo: UserInfo;
}

const RepayCreditDialog = () => {
    const { currentCreditBalance, repayCredit } = useBnpl();
    const { balance: mainBalance } = useBalance();
    const [repaymentAmount, setRepaymentAmount] = useState<number | string>('');

    const handleRepay = () => {
        const amount = Number(repaymentAmount);
        if (amount <= 0) {
            toast({ title: "Montant invalide", variant: 'destructive' });
            return;
        }
        repayCredit(amount);
        setRepaymentAmount('');
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rembourser votre Credit Marchands</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                    Le montant sera déduit de votre solde principal.
                    Solde disponible: {mainBalance.toLocaleString()} Fcfa.
                </p>
                <div>
                    <Label htmlFor="repayment-amount">Montant à rembourser (Fcfa)</Label>
                    <Input
                        id="repayment-amount"
                        type="number"
                        value={repaymentAmount}
                        onChange={(e) => setRepaymentAmount(e.target.value)}
                        placeholder={`ex: ${currentCreditBalance}`}
                    />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Annuler</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        onClick={handleRepay}
                        disabled={!repaymentAmount || Number(repaymentAmount) <= 0 || Number(repaymentAmount) > currentCreditBalance || Number(repaymentAmount) > mainBalance}
                    >
                        Confirmer le remboursement
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default function BalanceCards({ onNavigate, userInfo }: BalanceCardsProps) {
    const { balance } = useBalance();
    const { card } = useVirtualCard();
    const { vaults } = useVaults();
    const { tontines } = useTontine();
    const { flags } = useFeatureFlags();
    const { currentCreditBalance } = useBnpl();

    const isMerchant = userInfo.role === 'merchant';

    const totalVaultsBalance = vaults.reduce((acc, vault) => acc + vault.balance, 0);
    const totalTontinesBalance = tontines.reduce((acc, tontine) => acc + (tontine.amount * tontine.participants.length), 0);

    const allCards = [
        {
            id: 'transactions' as const,
            title: isMerchant ? 'Solde Marchand' : 'Solde Principal',
            balance: balance,
            icon: <Wallet className="h-5 w-5 text-white" />,
            color: 'from-primary to-blue-400',
            enabled: true,
            creditBalance: currentCreditBalance,
        },
        {
            id: 'ma-carte' as const,
            title: 'Carte Virtuelle',
            balance: card?.balance ?? 0,
            icon: <CreditCard className="h-5 w-5 text-white" />,
            color: 'from-sky-500 to-cyan-400',
            enabled: flags.virtualCards && !isMerchant
        },
        {
            id: 'coffres' as const,
            title: 'Mes Coffres',
            balance: totalVaultsBalance,
            icon: <PiggyBank className="h-5 w-5 text-white" />,
            color: 'from-amber-500 to-yellow-400',
            enabled: !isMerchant // Coffres are always enabled for now
        },
        {
            id: 'tontine' as const,
            title: 'Mes Tontines',
            balance: totalTontinesBalance,
            icon: <Users className="h-5 w-5 text-white" />,
            color: 'from-emerald-500 to-green-400',
            enabled: flags.tontine && !isMerchant
        }
    ];

    const cardsData = allCards.filter(c => c.enabled);

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
            {cardsData.map((c) => (
                <Card
                    key={c.id}
                    className={`text-white shadow-lg p-3 sm:p-4 flex flex-col justify-between bg-gradient-to-br ${c.color} border-none cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out`}
                    onClick={() => onNavigate(c.id)}
                >
                    <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm">{c.title}</p>
                        {c.icon}
                    </div>
                    <div className="text-right mt-2 sm:mt-4">
                        <p className="text-xl font-bold tracking-tight">{c.balance.toLocaleString()}</p>
                        <p className="text-xs opacity-80">Fcfa</p>
                    </div>
                     {c.creditBalance && c.creditBalance > 0 && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="mt-2 pt-2 border-t border-white/20 text-left text-xs flex justify-between items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                    <span>Credit Marchands: -{c.creditBalance.toLocaleString()} Fcfa</span>
                                    <Info className="h-3 w-3"/>
                                </div>
                            </DialogTrigger>
                            <RepayCreditDialog />
                        </Dialog>
                    )}
                </Card>
            ))}
        </div>
    );
}
