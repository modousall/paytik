

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from './use-toast';

export type RecurringPayment = {
  id: string;
  recipientAlias: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  reason: string;
};

type RecurringPaymentsContextType = {
  recurringPayments: RecurringPayment[];
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id'>) => void;
  removeRecurringPayment: (id: string) => void;
};

const RecurringPaymentsContext = createContext<RecurringPaymentsContextType | undefined>(undefined);

const recurringPaymentsStorageKey = 'midi_recurring_payments';

export const RecurringPaymentsProvider = ({ children, alias }: { children: ReactNode, alias: string }) => {
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const storageKey = `${recurringPaymentsStorageKey}_${alias}`;

  useEffect(() => {
    try {
      const storedPayments = localStorage.getItem(storageKey);
      if (storedPayments) {
        setRecurringPayments(JSON.parse(storedPayments));
      } else {
        setRecurringPayments([]);
      }
    } catch (error) {
      console.error("Failed to parse recurring payments from localStorage", error);
      setRecurringPayments([]);
    }
    setIsInitialized(true);
  }, [storageKey]);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(recurringPayments));
      } catch (error) {
        console.error("Failed to write recurring payments to localStorage", error);
      }
    }
  }, [recurringPayments, isInitialized, storageKey]);

  const addRecurringPayment = (payment: Omit<RecurringPayment, 'id'>) => {
    const newPayment = { ...payment, id: `rec-${Date.now()}` };
    setRecurringPayments(prev => [...prev, newPayment]);
  };

  const removeRecurringPayment = (id: string) => {
    setRecurringPayments(prev => prev.filter(p => p.id !== id));
    toast({ title: "Paiement annulé", description: "Le paiement récurrent a été arrêté." });
  };

  const value = { recurringPayments, addRecurringPayment, removeRecurringPayment };

  return (
    <RecurringPaymentsContext.Provider value={value}>
      {children}
    </RecurringPaymentsContext.Provider>
  );
};

export const useRecurringPayments = () => {
  const context = useContext(RecurringPaymentsContext);
  if (context === undefined) {
    throw new Error('useRecurringPayments must be used within a RecurringPaymentsProvider');
  }
  return context;
};
