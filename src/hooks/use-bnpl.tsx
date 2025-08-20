
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { assessBnplApplication } from '@/ai/flows/bnpl-assessment-flow';
import { useTransactions } from './use-transactions';
import { useBalance } from './use-balance';
import { toast } from './use-toast';
import type { BnplRequest, BnplAssessmentOutput } from '@/lib/types';


type BnplContextType = {
  requests: BnplRequest[];
  submitRequest: (merchantAlias: string, amount: number) => Promise<BnplAssessmentOutput>;
  updateRequestStatus: (id: string, status: 'approved' | 'rejected') => void;
};

const BnplContext = createContext<BnplContextType | undefined>(undefined);

const bnplStorageKey = 'paytik_bnpl_requests';

type BnplProviderProps = {
    children: ReactNode;
    alias: string;
};

export const BnplProvider = ({ children, alias }: BnplProviderProps) => {
  const [requests, setRequests] = useState<BnplRequest[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { transactions, addTransaction } = useTransactions();
  const { balance, debit } = useBalance();

  useEffect(() => {
    try {
      const storedRequests = localStorage.getItem(bnplStorageKey);
      if (storedRequests) {
        setRequests(JSON.parse(storedRequests));
      }
    } catch (error) {
        console.error("Failed to parse BNPL requests from localStorage", error);
        setRequests([]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        try {
            localStorage.setItem(bnplStorageKey, JSON.stringify(requests));
        } catch (error) {
            console.error("Failed to write BNPL requests to localStorage", error);
        }
    }
  }, [requests, isInitialized]);

  const submitRequest = async (merchantAlias: string, amount: number): Promise<BnplAssessmentOutput> => {
      const transactionHistory = transactions.slice(0, 10).map(t => ({ amount: t.amount, type: t.type, date: t.date }));

      const assessmentResult = await assessBnplApplication({
        alias,
        purchaseAmount: amount,
        currentBalance: balance,
        transactionHistory: transactionHistory,
      });

      const newRequest: BnplRequest = {
          id: `bnpl-${Date.now()}`,
          alias,
          merchantAlias,
          amount,
          status: assessmentResult.status,
          reason: assessmentResult.reason,
          repaymentPlan: assessmentResult.repaymentPlan,
          requestDate: new Date().toISOString(),
      };
      
      setRequests(prev => [...prev, newRequest]);
      
      if (assessmentResult.status === 'approved') {
          debit(amount);
          addTransaction({
              type: 'sent',
              counterparty: merchantAlias,
              reason: `Achat BNPL (Paiement Échelonné)`,
              amount,
              date: new Date().toISOString(),
              status: 'Terminé'
          });
      }

      return assessmentResult;
  };

  const updateRequestStatus = (id: string, status: 'approved' | 'rejected') => {
      setRequests(prev => prev.map(req => {
          if (req.id === id) {
              if (req.status === 'review' && status === 'approved') {
                // To do this properly, we'd need to find the user's balance and debit it.
                // This is a simplified version for the prototype.
                console.log(`Approving request ${id} for alias ${req.alias} for ${req.amount}`);
                toast({ title: "Demande approuvée", description: `La demande de ${req.alias} a été approuvée.`})
              }
               return { ...req, status };
          }
          return req;
      }));
  }

  const value = { requests, submitRequest, updateRequestStatus };

  return (
    <BnplContext.Provider value={value}>
      {children}
    </BnplContext.Provider>
  );
};

export const useBnpl = () => {
  const context = useContext(BnplContext);
  if (context === undefined) {
    throw new Error('useBnpl must be used within a BnplProvider');
  }
  return context;
};
