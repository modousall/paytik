
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
      const requestToUpdate = requests.find(r => r.id === id);
      if (!requestToUpdate) {
        console.error("BNPL request not found");
        return;
      }

      setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
      
      // If a request under review is approved, execute the transaction
      if (requestToUpdate.status === 'review' && status === 'approved') {
        const userKey = `paytik_user_${requestToUpdate.alias}`;
        const merchantKey = `paytik_user_${requestToUpdate.merchantAlias}`;
        
        try {
            // Debit the user
            const userBalanceKey = `paytik_balance_${requestToUpdate.alias}`;
            const userBalanceStr = localStorage.getItem(userBalanceKey);
            const userBalance = userBalanceStr ? JSON.parse(userBalanceStr) : 0;
            
            if(userBalance < requestToUpdate.amount) {
                 toast({ title: "Solde insuffisant", description: `L'utilisateur ${requestToUpdate.alias} n'a pas les fonds nécessaires.`, variant: "destructive" });
                 // Revert status
                 setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'review' } : req));
                 return;
            }
            
            const newUserBalance = userBalance - requestToUpdate.amount;
            localStorage.setItem(userBalanceKey, JSON.stringify(newUserBalance));

            // Add transaction for user
            const userTxKey = `paytik_transactions_${requestToUpdate.alias}`;
            const userTxStr = localStorage.getItem(userTxKey);
            const userTxs = userTxStr ? JSON.parse(userTxStr) : [];
            const userNewTx = {
                id: `TXN${Date.now()}`,
                type: 'sent',
                counterparty: requestToUpdate.merchantAlias,
                reason: `Achat BNPL approuvé`,
                amount: requestToUpdate.amount,
                date: new Date().toISOString(),
                status: 'Terminé'
            };
            localStorage.setItem(userTxKey, JSON.stringify([userNewTx, ...userTxs]));

            // Credit the merchant
            const merchantBalanceKey = `paytik_balance_${requestToUpdate.merchantAlias}`;
            const merchantBalanceStr = localStorage.getItem(merchantBalanceKey);
            const merchantBalance = merchantBalanceStr ? JSON.parse(merchantBalanceStr) : 0;
            const newMerchantBalance = merchantBalance + requestToUpdate.amount;
            localStorage.setItem(merchantBalanceKey, JSON.stringify(newMerchantBalance));

            // Add transaction for merchant
            const merchantTxKey = `paytik_transactions_${requestToUpdate.merchantAlias}`;
            const merchantTxStr = localStorage.getItem(merchantTxKey);
            const merchantTxs = merchantTxStr ? JSON.parse(merchantTxStr) : [];
             const merchantNewTx = {
                id: `TXN${Date.now()+1}`,
                type: 'received',
                counterparty: requestToUpdate.alias,
                reason: `Paiement BNPL reçu`,
                amount: requestToUpdate.amount,
                date: new Date().toISOString(),
                status: 'Terminé'
            };
            localStorage.setItem(merchantTxKey, JSON.stringify([merchantNewTx, ...merchantTxs]));

            toast({ title: "Demande approuvée", description: `La transaction pour ${requestToUpdate.alias} a été effectuée.` });

        } catch (error) {
            console.error("Failed to process manual BNPL approval:", error);
            toast({ title: "Erreur de traitement", description: "Une erreur est survenue lors de l'approbation.", variant: "destructive" });
            // Revert status on error
            setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'review' } : req));
        }

      } else {
         toast({ title: `Demande ${status === 'approved' ? 'approuvée' : 'rejetée'}`, description: `La demande de ${requestToUpdate.alias} a été mise à jour.`})
      }
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

