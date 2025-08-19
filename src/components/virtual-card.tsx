
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useVirtualCard } from '@/hooks/use-virtual-card';
import { Eye, EyeOff, Copy, Ban, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import Image from 'next/image';

export default function VirtualCard() {
  const { card, createCard, transactions, toggleFreeze, deleteCard } = useVirtualCard();
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: "Le numéro de la carte a été copié." });
  };

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Image src="https://placehold.co/300x200.png" width={300} height={200} alt="No card" className="mb-4 rounded-lg" data-ai-hint="credit card illustration" />
        <h2 className="text-2xl font-bold mb-2">Aucune carte virtuelle active</h2>
        <p className="text-muted-foreground mb-4">Créez une carte virtuelle pour effectuer des paiements en ligne sécurisés.</p>
        <Button onClick={createCard}>Créer ma carte virtuelle</Button>
      </div>
    );
  }

  return (
    <div>
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">Ma Carte Virtuelle</h2>
            <p className="text-muted-foreground">Utilisez cette carte pour vos paiements en ligne en toute sécurité.</p>
        </div>

        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-primary via-primary/80 to-accent/80 text-primary-foreground shadow-2xl mb-8 relative overflow-hidden">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold tracking-wider">PAYTIK CARD</CardTitle>
                    <p className="font-mono text-xl">VISA</p>
                </div>
            </CardHeader>
            <CardContent className="font-mono text-center text-2xl tracking-widest space-y-4">
                <p>{showDetails ? card.number : `**** **** **** ${card.number.slice(-4)}`}</p>
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
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                 <Button variant="ghost" size="icon" onClick={() => setShowDetails(!showDetails)} className="hover:bg-white/20">
                    {showDetails ? <EyeOff /> : <Eye />}
                 </Button>
                 <Button variant="ghost" onClick={() => handleCopy(card.number)} className="hover:bg-white/20">
                    <Copy className="mr-2" /> Copier
                 </Button>
            </CardFooter>
            {card.isFrozen && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-2xl font-bold text-white/90 transform -rotate-12">GELÉE</p>
                </div>
            )}
        </Card>

        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <Button variant="outline" onClick={toggleFreeze}>
                <Ban className="mr-2" /> {card.isFrozen ? "Dégeler" : "Geler"}
            </Button>
            <Button variant="outline">Approvisionner</Button>
            <Button variant="destructive" onClick={deleteCard}>
                <Trash2 className="mr-2" /> Supprimer
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Transactions de la carte</CardTitle>
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
    </div>
  );
}
