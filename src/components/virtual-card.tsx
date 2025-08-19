
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useVirtualCard } from '@/hooks/use-virtual-card';
import { Eye, EyeOff, Copy, Ban, Trash2, ArrowUp, ArrowDown, ArrowLeft, Wallet } from "lucide-react";
import Image from 'next/image';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

type VirtualCardProps = {
    onBack: () => void;
};

const RechargeDialog = ({ onRecharge }: { onRecharge: (amount: number) => void }) => {
    const [amount, setAmount] = useState(0);
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Recharger la carte</DialogTitle>
            </DialogHeader>
            <div className='space-y-4 py-4'>
                <Label htmlFor="recharge-amount">Montant à recharger (Fcfa)</Label>
                <Input 
                    id="recharge-amount" 
                    type="number" 
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="ex: 10000"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Annuler</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={() => onRecharge(amount)} disabled={amount <= 0}>
                        Recharger
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default function VirtualCard({ onBack }: VirtualCardProps) {
  const { card, transactions, createCard, toggleFreeze, deleteCard, rechargeCard } = useVirtualCard();
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: "Le numéro de la carte a été copié." });
  };

  const handleRecharge = (amount: number) => {
    rechargeCard(amount);
  }

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Image src="https://placehold.co/300x200.png" width={300} height={200} alt="No card" className="mb-4 rounded-lg" data-ai-hint="credit card illustration" />
        <h2 className="text-2xl font-bold mb-2">Aucune carte virtuelle active</h2>
        <p className="text-muted-foreground mb-4">Créez une carte virtuelle pour effectuer des paiements en ligne sécurisés.</p>
        <div className='flex gap-4'>
            <Button variant="outline" onClick={onBack}>Retour</Button>
            <Button onClick={createCard}>Créer ma carte virtuelle</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
        <div className="flex items-center gap-4 mb-6">
            <Button onClick={onBack} variant="ghost" size="icon">
                <ArrowLeft />
            </Button>
            <div>
                <h2 className="text-2xl font-bold text-primary">Ma Carte Virtuelle</h2>
                <p className="text-muted-foreground">Utilisez cette carte pour vos paiements en ligne en toute sécurité.</p>
            </div>
        </div>

        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-primary via-primary/80 to-accent/80 text-primary-foreground shadow-2xl mb-8 relative overflow-hidden">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-semibold tracking-wider">PAYTIK CARD</CardTitle>
                        <p className="text-xs opacity-80">Virtual</p>
                    </div>
                    <p className="font-mono text-xl">VISA</p>
                </div>
            </CardHeader>
            <CardContent className="font-mono space-y-4">
                <p className="text-center text-2xl tracking-widest">{showDetails ? card.number : `**** **** **** ${card.number.slice(-4)}`}</p>
                <div className="flex justify-between text-sm">
                    <div>
                        <p className="text-xs opacity-70">Expire Fin</p>
                        <p>{showDetails ? card.expiry : "**/**"}</p>
                    </div>
                    <div>
                        <p className="text-xs opacity-70">CVV</p>
                        <p>{showDetails ? card.cvv : "***"}</p>
                    </div>
                </div>
                 <div className="text-right pt-2">
                    <p className="text-xs opacity-70">Solde disponible</p>
                    <p className="text-lg font-bold">{card.balance.toLocaleString()} Fcfa</p>
                </div>
            </CardContent>
            
            {card.isFrozen && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className='text-center'>
                        <Ban size={48} className='mx-auto mb-2 text-white/80' />
                        <p className="text-2xl font-bold text-white/90">CARTE GELÉE</p>
                    </div>
                </div>
            )}
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center max-w-2xl mx-auto">
             <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? <EyeOff /> : <Eye />} {showDetails ? "Cacher" : "Afficher"}
             </Button>
             <Button variant="outline" onClick={() => handleCopy(card.number)}>
                <Copy /> Copier N°
             </Button>
             <Button variant="outline" onClick={toggleFreeze}>
                <Ban /> {card.isFrozen ? "Dégeler" : "Geler"}
            </Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive" onClick={deleteCard}>
                        <Trash2 /> Supprimer
                    </Button>
                </DialogTrigger>
            </Dialog>
        </div>
        
        <Dialog>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Transactions de la carte</CardTitle>
                        <DialogTrigger asChild>
                            <Button><Wallet className="mr-2"/>Approvisionner</Button>
                        </DialogTrigger>
                    </div>
                    <CardDescription>Historique des paiements effectués avec cette carte.</CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length > 0 ? (
                        <div className="space-y-4">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === 'debit' ? 'bg-red-100' : 'bg-green-100'}`}>
                                        {tx.type === 'debit' ? <ArrowUp className="text-red-600"/> : <ArrowDown className="text-green-600"/>}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{tx.merchant}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className={`ml-auto font-semibold ${tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'debit' ? '-' : '+'} {tx.amount.toLocaleString()} Fcfa
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucune transaction pour cette carte.</p>
                    )}
                </CardContent>
            </Card>
            <RechargeDialog onRecharge={handleRecharge} />
        </Dialog>
    </div>
  );
}
