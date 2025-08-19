
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Vault = {
  id: string;
  name: string;
  balance: number;
  targetAmount: number | null;
};

type VaultsContextType = {
  vaults: Vault[];
  addVault: (vault: Omit<Vault, 'id'>) => void;
  deposit: (id: string, amount: number) => void;
  withdraw: (id: string, amount: number) => void;
};

const VaultsContext = createContext<VaultsContextType | undefined>(undefined);

const initialVaults: Vault[] = [
    {
        id: 'vault1',
        name: 'Économies Vacances',
        balance: 125000,
        targetAmount: 500000,
    }
];

type VaultsProviderProps = {
    children: ReactNode;
};

export const VaultsProvider = ({ children }: VaultsProviderProps) => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedVaults = localStorage.getItem('paytik_vaults');
      if (storedVaults) {
        setVaults(JSON.parse(storedVaults));
      } else {
        setVaults(initialVaults);
      }
    } catch (error) {
        console.error("Failed to parse vaults from localStorage", error);
        setVaults(initialVaults);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem('paytik_vaults', JSON.stringify(vaults));
    }
  }, [vaults, isInitialized]);

  const addVault = (vault: Omit<Vault, 'id'>) => {
    const newVault: Vault = { 
        ...vault, 
        id: `vault-${Date.now()}`,
    };
    setVaults(prevVaults => [...prevVaults, newVault]);
  };
  
  const deposit = (id: string, amount: number) => {
    setVaults(prevVaults => prevVaults.map(v => v.id === id ? { ...v, balance: v.balance + amount } : v));
  }

  const withdraw = (id: string, amount: number) => {
    setVaults(prevVaults => prevVaults.map(v => v.id === id ? { ...v, balance: v.balance - amount } : v));
  }

  const value = { vaults, addVault, deposit, withdraw };

  return (
    <VaultsContext.Provider value={value}>
      {children}
    </VaultsContext.Provider>
  );
};

export const useVaults = () => {
  const context = useContext(VaultsContext);
  if (context === undefined) {
    throw new Error('useVaults must be used within a VaultsProvider');
  }
  return context;
};
