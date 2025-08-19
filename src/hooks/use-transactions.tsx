"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Transaction = {
  id: string;
  type: "sent" | "received" | "tontine";
  counterparty: string;
  reason: string;
  date: string;
  amount: number;
  status: "Terminé" | "En attente" | "Échoué";
};

type TransactionsContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

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
      reason: "Achat T-shirt",
      date: "2024-07-24T18:05:00Z",
      amount: 12500,
      status: "Terminé",
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

type TransactionsProviderProps = {
    children: ReactNode;
};

export const TransactionsProvider = ({ children }: TransactionsProviderProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('paytik_transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions(initialTransactions);
      }
    } catch (error) {
        console.error("Failed to parse transactions from localStorage", error);
        setTransactions(initialTransactions);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if(isInitialized) {
        localStorage.setItem('paytik_transactions', JSON.stringify(transactions));
    }
  }, [transactions, isInitialized]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
        ...transaction,
        id: `TXN${Math.floor(Math.random() * 900000) + 100000}`
    };
    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
  };

  const value = { transactions, addTransaction };

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
