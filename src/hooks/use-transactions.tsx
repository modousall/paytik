
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Transaction = {
  id: string;
  type: "sent" | "received" | "tontine" | "card_recharge" | "versement";
  counterparty: string;
  reason: string;
  date: string;
  amount: number;
  status: "Terminé" | "En attente" | "Échoué" | "Retourné";
};

type TransactionsContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  reverseTransaction: (transactionId: string) => void;
};

export const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
    {
      id: "TXN746382",
      type: "received",
      counterparty: "+221776543210",
      reason: "Remboursement",
      date: "2024-07-25T14:30:00Z",
      amount: 5000,
      status: "Terminé",
    },
    {
      id: "TXN927481",
      type: "sent",
      counterparty: "BoutiqueEnLigne Merch",
      reason: "Facture SENELEC - Électricité - 123456",
      date: "2024-07-24T18:05:00Z",
      amount: 12500,
      status: "Retourné",
    },
    {
      id: "TXN102938",
      type: "tontine",
      counterparty: "Tontine Familiale",
      reason: "Contribution mensuelle",
      date: "2024-07-23T10:00:00Z",
      amount: 20000,
      status: "Terminé",
    }
];

// This context can now be used for any user, including the 'superadmin' account for logging settlements
type TransactionsProviderProps = {
    children: ReactNode;
    alias: string;
};

export const TransactionsProvider = ({ children, alias }: TransactionsProviderProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const storageKey = `paytik_transactions_${alias}`;

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(storageKey);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        // New user starts with no transactions
        setTransactions([]);
      }
    } catch (error) {
        console.error("Failed to parse transactions from localStorage", error);
        setTransactions([]);
    }
    setIsInitialized(true);
  }, [storageKey]);

  useEffect(() => {
    if(isInitialized) {
        localStorage.setItem(storageKey, JSON.stringify(transactions));
    }
  }, [transactions, isInitialized, storageKey]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
        ...transaction,
        id: `TXN${Math.floor(Math.random() * 900000) + 100000}`
    };
    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
  };

  const reverseTransaction = (transactionId: string) => {
    setTransactions(prevTransactions => {
        const txToReverse = prevTransactions.find(tx => tx.id === transactionId);
        if (!txToReverse) return prevTransactions;

        const reversalTransaction: Omit<Transaction, 'id'> = {
            type: txToReverse.type === 'sent' ? 'received' : 'sent',
            counterparty: txToReverse.counterparty,
            reason: `Retour: ${txToReverse.reason}`,
            date: new Date().toISOString(),
            amount: txToReverse.amount,
            status: "Terminé",
        };

        const newTransaction = {
            ...reversalTransaction,
            id: `RTN${Math.floor(Math.random() * 900000) + 100000}`
        };

        const updatedTransactions = prevTransactions.map(tx => 
            tx.id === transactionId ? { ...tx, status: 'Retourné' as const } : tx
        );

        return [newTransaction, ...updatedTransactions];
    });
  };

  const value = { transactions, addTransaction, reverseTransaction };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
