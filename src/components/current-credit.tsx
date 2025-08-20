
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useBnpl } from '@/hooks/use-bnpl';
import { useBalance } from '@/hooks/use-balance';
import { HandCoins } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CurrentCredit() {
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
        <Card className="border-accent bg-accent/5">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                     <HandCoins className="h-6 w-6 text-accent" />
                    <CardTitle className="text-accent">Mon Crédit en Cours</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Montant total dû</p>
                        <p className="text-3xl font-bold">{currentCreditBalance.toLocaleString()} Fcfa</p>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button>Rembourser</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Rembourser votre crédit</DialogTitle>
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
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}
