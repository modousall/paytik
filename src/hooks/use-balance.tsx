
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type BalanceContextType = {
  balance: number;
  credit: (amount: number) => void;
  debit: (amount: number) => void;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

const initialBalance = 22017800;

type BalanceProviderProps = {
    children: ReactNode;
};

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedBalance = localStorage.getItem('paytik_balance');
      if (storedBalance) {
        setBalance(JSON.parse(storedBalance));
      } else {
        setBalance(initialBalance);
      }
    } catch (error) {
        console.error("Failed to parse balance from localStorage", error);
        setBalance(initialBalance);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem('paytik_balance', JSON.stringify(balance));
    }
  }, [balance, isInitialized]);

  const credit = (amount: number) => {
    setBalance(prevBalance => prevBalance + amount);
  };

  const debit = (amount: number) => {
    setBalance(prevBalance => prevBalance - amount);
  };

  const value = { balance, credit, debit };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};
