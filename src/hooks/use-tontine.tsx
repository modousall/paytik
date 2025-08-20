
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type TontineFrequency = 'daily' | 'weekly' | 'monthly';

export type Tontine = {
  id: string;
  name: string;
  participants: string[]; // array of contact IDs
  amount: number;
  frequency: TontineFrequency;
  progress: number;
  isMyTurn: boolean;
};

type TontineContextType = {
  tontines: Tontine[];
  addTontine: (tontine: Omit<Tontine, 'id' | 'progress' | 'isMyTurn'>) => void;
};

const TontineContext = createContext<TontineContextType | undefined>(undefined);

const initialTontines: Tontine[] = [
    {
        id: "tontine1",
        name: "Tontine Familiale Mensuelle",
        participants: ['1', '3'],
        amount: 100000,
        frequency: "monthly",
        progress: 75,
        isMyTurn: false,
    },
    {
        id: "tontine2",
        name: "Collègues du bureau",
        participants: ['2'],
        amount: 20000,
        frequency: "monthly",
        progress: 90,
        isMyTurn: true,
    }
];

type TontineProviderProps = {
    children: ReactNode;
    alias: string;
};

export const TontineProvider = ({ children, alias }: TontineProviderProps) => {
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const storageKey = `paytik_tontines_${alias}`;

  useEffect(() => {
    try {
      const storedTontines = localStorage.getItem(storageKey);
      if (storedTontines) {
        setTontines(JSON.parse(storedTontines));
      } else {
        // New user starts with no tontines
        setTontines([]);
      }
    } catch (error) {
        console.error("Failed to parse tontines from localStorage", error);
        setTontines([]);
    }
    setIsInitialized(true);
  }, [storageKey]);

  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem(storageKey, JSON.stringify(tontines));
    }
  }, [tontines, isInitialized, storageKey]);

  const addTontine = (tontine: Omit<Tontine, 'id' | 'progress' | 'isMyTurn'>) => {
    const newTontine: Tontine = { 
        ...tontine, 
        id: `tontine-${Date.now()}`,
        progress: 0, 
        isMyTurn: false 
    };
    setTontines(prevTontines => [...prevTontines, newTontine]);
  };

  const value = { tontines, addTontine };

  return (
    <TontineContext.Provider value={value}>
      {children}
    </TontineContext.Provider>
  );
};

export const useTontine = () => {
  const context = useContext(TontineContext);
  if (context === undefined) {
    throw new Error('useTontine must be used within a TontineProvider');
  }
  return context;
};
