

"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useVirtualCard } from '@/hooks/use-virtual-card';
import { Eye, EyeOff, Copy, Ban, Trash2, ArrowUp, ArrowDown, ArrowLeft, Wallet } from "lucide-react";
import Image from 'next/image';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useBalance } from '@/hooks/use-balance';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { formatCurrency } from '@/lib/utils';

type VirtualCardProps = {
    onBack: () => void;
    cardHolderName: string;
};

const ManageCardFundsDialog = ({ card, onRecharge, onWithdraw }: { card: any, onRecharge: (amount: number) => void, onWithdraw: (amount: number) => void }) => {
    const [amount, setAmount] = useState(0);
    const [action, setAction] = useState<'recharge' | 'withdraw' | null>(null);
    const { balance: mainBalance } = useBalance();

    const handleRecharge = () => {
        onRecharge(amount);
        setAction(null);
        setAmount(0);
    }
    
    const handleWithdraw = () => {
        onWithdraw(amount);
        setAction(null);
        setAmount(0);
    }

    if (action === 'recharge') {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Approvisionner la carte</DialogTitle>
                </DialogHeader>
                 <div className='space-y-4 py-4'>
                    <p className='text-sm text-muted-foreground'>Les fonds seront prélevés de votre solde principal. Solde disponible: {formatCurrency(mainBalance)}.</p>
                    <Label htmlFor="recharge-amount">Montant à recharger</Label>
                    <Input 
                        id="recharge-amount" 
                        type="number" 
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="ex: 10000"
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setAction(null)}>Retour</Button>
                    <DialogClose asChild>
                        <Button onClick={handleRecharge} disabled={amount <= 0 || amount > mainBalance}>
                            Confirmer
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        )
    }

    if (action === 'withdraw') {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Retirer de la carte</DialogTitle>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                    <p className='text-sm text-muted-foreground'>Les fonds seront versés sur votre solde principal. Solde disponible sur la carte: {formatCurrency(card.balance)}.</p>
                    <Label htmlFor="withdraw-amount">Montant à retirer</Label>
                    <Input 
                        id="withdraw-amount" 
                        type="number" 
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="ex: 5000"
                    />
                </div>
                <DialogFooter>
                     <Button type="button" variant="ghost" onClick={() => setAction(null)}>Retour</Button>
                     <DialogClose asChild>
                        <Button onClick={handleWithdraw} disabled={amount <= 0 || amount > card.balance}>
                            Confirmer
                        </Button>
                     </DialogClose>
                </DialogFooter>
            </DialogContent>
        )
    }


    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Gérer les fonds de la carte</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <Button variant="outline" className="py-10 flex-col h-auto" onClick={() => setAction('withdraw')}>
                    <ArrowDown className="h-6 w-6 mb-2"/> Retirer vers solde principal
                </Button>
                <Button className="py-10 flex-col h-auto bg-primary hover:bg-primary/90" onClick={() => setAction('recharge')}>
                    <ArrowUp className="h-6 w-6 mb-2"/> Approvisionner la carte
                </Button>
            </div>
        </DialogContent>
    );
};

export default function VirtualCard({ onBack, cardHolderName }: VirtualCardProps) {
  const { card, transactions, createCard, toggleFreeze, deleteCard, rechargeCard, withdrawFromCard } = useVirtualCard();
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const { flags } = useFeatureFlags();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: "Le numéro de la carte a été copié." });
  };

  const handleRecharge = (amount: number) => {
    rechargeCard(amount);
  }

  const handleWithdraw = (amount: number) => {
    withdrawFromCard(amount);
  }
  
  if (!flags.virtualCards) {
      return (
          <div className="text-center p-8">
              <h2 className="text-xl font-bold">Fonctionnalité désactivée</h2>
              <p className="text-muted-foreground">La création de cartes virtuelles est actuellement désactivée par l'administrateur.</p>
              <Button onClick={onBack} className="mt-4">Retour</Button>
          </div>
      )
  }

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Image src="https://placehold.co/280x180.png" width={280} height={180} alt="No card" className="mb-4 rounded-lg" data-ai-hint="credit card illustration" />
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
                <h2 className="text-2xl font-bold text-primary">Carte Virtuelle</h2>
                <p className="text-muted-foreground">Paiement en ligne sécurisé.</p>
            </div>
        </div>
        
        <div className="w-full max-w-md mx-auto space-y-4">
            <Card className="bg-gradient-to-br from-primary via-primary/80 to-accent/80 text-primary-foreground shadow-2xl relative overflow-hidden aspect-[1.586/1] font-mono">
                <CardContent className="p-4 sm:p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm sm:text-base font-semibold tracking-wider">PAYTIK CARD</p>
                            <p className="text-xs opacity-80 text-primary-foreground/80">Virtual</p>
                        </div>
                        <p className="text-base sm:text-xl">VISA</p>
                    </div>
                    
                    <div className='space-y-1'>
                        <p className="text-center text-lg sm:text-xl tracking-widest">{showDetails ? card.number : `**** **** **** ${card.number.slice(-4)}`}</p>
                        <div className="flex justify-between text-xs sm:text-sm pt-2">
                            <div>
                                <p className="opacity-70">Expire Fin</p>
                                <p>{showDetails ? card.expiry : "**/**"}</p>
                            </div>
                            <div>
                                <p className="opacity-70">CVV</p>
                                <p>{showDetails ? card.cvv : "***"}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs opacity-70">Titulaire</p>
                        <p className="font-medium tracking-wider uppercase text-sm">{cardHolderName}</p>
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

            <Card>
                <CardContent className="p-4 flex justify-between items-center">
                    <p className="text-muted-foreground">Solde de la carte</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(card.balance)}</p>
                </CardContent>
            </Card>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-center max-w-2xl mx-auto">
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
                    <Button variant="destructive">
                        <Trash2 /> Supprimer
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Êtes-vous sûr ?</DialogTitle>
                    </DialogHeader>
                    <p>La suppression de votre carte est définitive. Voulez-vous continuer ?</p>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button variant="ghost">Annuler</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant="destructive" onClick={deleteCard}>Supprimer</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        
        <Card className="max-w-2xl mx-auto mt-8">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Transactions</CardTitle>
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button><Wallet className="mr-2"/>Gérer les fonds</Button>
                        </DialogTrigger>
                        <ManageCardFundsDialog 
                            card={card} 
                            onRecharge={handleRecharge}
                            onWithdraw={handleWithdraw}
                        />
                     </Dialog>
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
                                    <p className="font-semibold text-sm">{tx.merchant}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                                <p className={`ml-auto font-semibold text-sm ${tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                                    {tx.type === 'debit' ? '-' : '+'} {formatCurrency(tx.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune transaction pour cette carte.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
