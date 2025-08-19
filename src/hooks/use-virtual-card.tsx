
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './use-toast';

type CardDetails = {
  number: string;
  expiry: string;
  cvv: string;
  isFrozen: boolean;
  balance: number;
};

type CardTransaction = {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  merchant: string;
  date: string;
};

type VirtualCardContextType = {
  card: CardDetails | null;
  transactions: CardTransaction[];
  createCard: () => void;
  toggleFreeze: () => void;
  deleteCard: () => void;
  rechargeCard: (amount: number) => void;
  withdrawFromCard: (amount: number) => void;
};

const VirtualCardContext = createContext<VirtualCardContextType | undefined>(undefined);

const generateCardDetails = (): CardDetails => ({
    number: `4${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
    expiry: `${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}/${new Date().getFullYear() % 100 + 3}`,
    cvv: `${Math.floor(100 + Math.random() * 900)}`,
    isFrozen: false,
    balance: 50000, // Initial balance
});

const initialCreditTransaction = (balance: number): CardTransaction => ({
    id: 'vtx0',
    type: 'credit',
    amount: balance,
    merchant: 'Crédit Initial',
    date: new Date().toISOString(),
});


export const VirtualCardProvider = ({ children }: { children: ReactNode }) => {
  const [card, setCard] = useState<CardDetails | null>(null);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let storedCard: CardDetails | null = null;
    let storedTransactions: CardTransaction[] | null = null;
    try {
        const cardData = localStorage.getItem('paytik_virtual_card');
        if (cardData) {
            storedCard = JSON.parse(cardData);
        }
        const txData = localStorage.getItem('paytik_virtual_card_txs');
        if(txData) {
            storedTransactions = JSON.parse(txData);
        }
    } catch (error) {
        console.error("Failed to parse virtual card from localStorage", error);
        storedCard = null;
        storedTransactions = null;
    }

    if (storedCard) {
        setCard(storedCard);
        setTransactions(storedTransactions || [initialCreditTransaction(storedCard.balance)]);
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        if(card) {
            localStorage.setItem('paytik_virtual_card', JSON.stringify(card));
            localStorage.setItem('paytik_virtual_card_txs', JSON.stringify(transactions));
        } else {
            localStorage.removeItem('paytik_virtual_card');
            localStorage.removeItem('paytik_virtual_card_txs');
        }
    }
  }, [card, transactions, isInitialized]);


  const createCard = () => {
    if (!card) {
      const newCard = generateCardDetails();
      setCard(newCard);
      setTransactions([initialCreditTransaction(newCard.balance)]);
      toast({ title: "Carte créée !", description: "Votre carte virtuelle est prête à être utilisée." });
    }
  };

  const toggleFreeze = () => {
    if (card) {
      const isNowFrozen = !card.isFrozen;
      setCard({ ...card, isFrozen: isNowFrozen });
      toast({ title: isNowFrozen ? "Carte gelée" : "Carte dégelée", description: `Votre carte a été ${isNowFrozen ? 'gelée' : 'dégelée'} avec succès.` });
    }
  };

  const deleteCard = () => {
    setCard(null);
    setTransactions([]);
    toast({ title: "Carte supprimée", description: "Votre carte virtuelle a été supprimée.", variant: "destructive" });
  };
  
  const rechargeCard = (amount: number) => {
    if (card && amount > 0) {
        setCard(prevCard => prevCard ? { ...prevCard, balance: prevCard.balance + amount } : null);
        
        const newTransaction: CardTransaction = {
            id: `vtx${Date.now()}`,
            type: 'credit',
            amount,
            merchant: 'Approvisionnement',
            date: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);

        toast({
            title: "Rechargement réussi",
            description: `Votre carte a été rechargée de ${amount.toLocaleString()} Fcfa.`
        });
    }
  }

  const withdrawFromCard = (amount: number) => {
    if (card && amount > 0 && card.balance >= amount) {
        setCard(prevCard => prevCard ? { ...prevCard, balance: prevCard.balance - amount } : null);
        
        const newTransaction: CardTransaction = {
            id: `vtx${Date.now()}`,
            type: 'debit',
            amount,
            merchant: 'Transfert vers Solde Principal',
            date: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);
        toast({
            title: "Retrait réussi",
            description: `${amount.toLocaleString()} Fcfa ont été transférés sur votre solde principal.`
        });
    }
  }

  return (
    <VirtualCardContext.Provider value={{ card, transactions, createCard, toggleFreeze, deleteCard, rechargeCard, withdrawFromCard }}>
      {children}
    </VirtualCardContext.Provider>
  );
};

export const useVirtualCard = () => {
  const context = useContext(VirtualCardContext);
  if (context === undefined) {
    throw new Error('useVirtualCard must be used within a VirtualCardProvider');
  }
  return context;
};
