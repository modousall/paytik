
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
        isMyTurn: false,
    }
];

type TontineProviderProps = {
    children: ReactNode;
};

export const TontineProvider = ({ children }: TontineProviderProps) => {
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedTontines = localStorage.getItem('paytik_tontines');
      if (storedTontines) {
        setTontines(JSON.parse(storedTontines));
      } else {
        setTontines(initialTontines);
      }
    } catch (error) {
        console.error("Failed to parse tontines from localStorage", error);
        setTontines(initialTontines);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem('paytik_tontines', JSON.stringify(tontines));
    }
  }, [tontines, isInitialized]);

  const addTontine = (tontine: Omit<Tontine, 'id' | 'progress' | 'isMyTurn'>) => {
    const newTontine: Tontine = { 
        ...tontine, 
        id: `tontine-${Date.now()}`,
        progress: 0, // A new tontine starts with 0 progress
        isMyTurn: false // Not the user's turn initially
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
