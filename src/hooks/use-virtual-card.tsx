
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './use-toast';

type CardDetails = {
  number: string;
  expiry: string;
  cvv: string;
  isFrozen: boolean;
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
};

const VirtualCardContext = createContext<VirtualCardContextType | undefined>(undefined);

const generateCardDetails = (): CardDetails => ({
    number: `4${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
    expiry: `${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}/${new Date().getFullYear() % 100 + 3}`,
    cvv: `${Math.floor(100 + Math.random() * 900)}`,
    isFrozen: false
});

const initialTransactions: CardTransaction[] = [
    { id: 'vtx1', type: 'debit', amount: 15000, merchant: 'Amazon', date: new Date().toISOString() },
    { id: 'vtx2', type: 'debit', amount: 4500, merchant: 'Netflix', date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'vtx3', type: 'credit', amount: 50000, merchant: 'Approvisionnement', date: new Date(Date.now() - 86400000 * 5).toISOString() }
];

export const VirtualCardProvider = ({ children }: { children: ReactNode }) => {
  const [card, setCard] = useState<CardDetails | null>(null);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
        const storedCard = localStorage.getItem('paytik_virtual_card');
        const storedTransactions = localStorage.getItem('paytik_virtual_card_txs');
        if (storedCard) {
            setCard(JSON.parse(storedCard));
        }
        if (storedTransactions) {
            setTransactions(JSON.parse(storedTransactions));
        } else if (storedCard) { // if card exists but no txs, load initial txs
            setTransactions(initialTransactions);
        }
    } catch (error) {
        console.error("Failed to parse virtual card from localStorage", error);
        setCard(null); // Reset to a safe state
        setTransactions([]);
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
      setTransactions(initialTransactions);
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

  return (
    <VirtualCardContext.Provider value={{ card, transactions, createCard, toggleFreeze, deleteCard }}>
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
