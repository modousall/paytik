
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './use-toast';
import { useBalance } from './use-balance';
import { useTransactions } from './use-transactions';

const VIRTUAL_CARD_BALANCE_LIMIT = 2000000;

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
    balance: 0, // New cards start with 0 balance
});

const initialCreditTransaction = (balance: number): CardTransaction => ({
    id: 'vtx0',
    type: 'credit',
    amount: balance,
    merchant: 'Crédit Initial',
    date: new Date().toISOString(),
});


export const VirtualCardProvider = ({ children, alias }: { children: ReactNode, alias: string }) => {
  const [card, setCard] = useState<CardDetails | null>(null);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const { toast } = useToast();
  const { balance: mainBalance, debit: debitMain, credit: creditMain } = useBalance();
  const { addTransaction } = useTransactions();
  const [isInitialized, setIsInitialized] = useState(false);

  const cardStorageKey = `paytik_virtual_card_${alias}`;
  const txStorageKey = `paytik_virtual_card_txs_${alias}`;

  useEffect(() => {
    let storedCard: CardDetails | null = null;
    let storedTransactions: CardTransaction[] | null = null;
    try {
        const cardData = localStorage.getItem(cardStorageKey);
        if (cardData) {
            storedCard = JSON.parse(cardData);
        }
        const txData = localStorage.getItem(txStorageKey);
        if(txData) {
            storedTransactions = JSON.parse(txData);
        }
    } catch (error) {
        console.error("Failed to parse virtual card from localStorage", error);
        storedCard = null;
        storedTransactions = null;
    }

    setCard(storedCard);
    setTransactions(storedTransactions || []);
    setIsInitialized(true);
  }, [cardStorageKey, txStorageKey]);

  useEffect(() => {
    if (isInitialized) {
        if(card) {
            localStorage.setItem(cardStorageKey, JSON.stringify(card));
            localStorage.setItem(txStorageKey, JSON.stringify(transactions));
        } else {
            localStorage.removeItem(cardStorageKey);
            localStorage.removeItem(txStorageKey);
        }
    }
  }, [card, transactions, isInitialized, cardStorageKey, txStorageKey]);


  const createCard = () => {
    if (!card) {
      const newCard = generateCardDetails();
      setCard(newCard);
      setTransactions([]); // Start with no transactions
      toast({ title: "Carte créée !", description: "Votre carte virtuelle est prête à être utilisée. N'oubliez pas de l'approvisionner." });
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
    if(card && card.balance > 0) {
        creditMain(card.balance); // Refund remaining balance
        addTransaction({
            type: 'received',
            counterparty: 'Carte Virtuelle',
            reason: 'Remboursement Solde Final',
            date: new Date().toISOString(),
            amount: card.balance,
            status: 'Terminé',
        });
    }
    setCard(null);
    setTransactions([]);
    toast({ title: "Carte supprimée", description: "Votre carte virtuelle a été supprimée et le solde restant a été transféré à votre solde principal.", variant: "destructive" });
  };
  
  const rechargeCard = (amount: number) => {
    if (card && amount > 0) {
        if(amount > mainBalance) {
             toast({ title: "Solde principal insuffisant", variant: "destructive" });
             return;
        }
        if (card.balance + amount > VIRTUAL_CARD_BALANCE_LIMIT) {
            toast({ title: "Plafond de la carte atteint", description: `Le solde de la carte ne peut excéder ${VIRTUAL_CARD_BALANCE_LIMIT.toLocaleString()} Fcfa.`, variant: "destructive" });
            return;
        }

        debitMain(amount);
        setCard(prevCard => prevCard ? { ...prevCard, balance: prevCard.balance + amount } : null);
        
        const newTransaction: CardTransaction = {
            id: `vtx${Date.now()}`,
            type: 'credit',
            amount,
            merchant: 'Approvisionnement',
            date: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);

        addTransaction({
            type: 'sent',
            counterparty: 'Carte Virtuelle',
            reason: 'Approvisionnement',
            date: new Date().toISOString(),
            amount: amount,
            status: 'Terminé',
        });

        toast({
            title: "Rechargement réussi",
            description: `Votre carte a été rechargée de ${amount.toLocaleString()} Fcfa.`
        });
    }
  }

  const withdrawFromCard = (amount: number) => {
    if (card && amount > 0 && card.balance >= amount) {
        setCard(prevCard => prevCard ? { ...prevCard, balance: prevCard.balance - amount } : null);
        creditMain(amount);
        
        const newTransaction: CardTransaction = {
            id: `vtx${Date.now()}`,
            type: 'debit',
            amount,
            merchant: 'Transfert vers Solde Principal',
            date: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);

        addTransaction({
            type: 'received',
            counterparty: 'Carte Virtuelle',
            reason: 'Retrait',
            date: new Date().toISOString(),
            amount: amount,
            status: 'Terminé',
        });

        toast({
            title: "Retrait réussi",
            description: `${amount.toLocaleString()} Fcfa ont été transférés sur votre solde principal.`
        });
    } else if (card && amount > card.balance) {
        toast({ title: "Solde de la carte insuffisant", variant: "destructive"});
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
