
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { assessBnplApplication } from '@/ai/flows/bnpl-assessment-flow';
import { useTransactions } from './use-transactions';
import { useBalance } from './use-balance';
import { toast } from './use-toast';
import type { BnplRequest, BnplAssessmentOutput } from '@/lib/types';


type BnplContextType = {
  allRequests: BnplRequest[];
  myRequests: BnplRequest[];
  currentCreditBalance: number;
  kpis: {
    totalApprovedAmount: number;
    pendingRequests: number;
    approvalRate: number;
  };
  submitRequest: (merchantAlias: string, amount: number) => Promise<BnplAssessmentOutput>;
  updateRequestStatus: (id: string, status: 'approved' | 'rejected') => void;
  repayCredit: (amount: number) => void;
};

const BnplContext = createContext<BnplContextType | undefined>(undefined);

const bnplStorageKey = 'paytik_bnpl_requests';

type BnplProviderProps = {
    children: ReactNode;
    alias: string;
};

export const BnplProvider = ({ children, alias }: BnplProviderProps) => {
  const [allRequests, setAllRequests] = useState<BnplRequest[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { transactions, addTransaction } = useTransactions();
  const { balance, debit, credit } = useBalance();

  useEffect(() => {
    try {
      const storedRequests = localStorage.getItem(bnplStorageKey);
      if (storedRequests) {
        setAllRequests(JSON.parse(storedRequests));
      }
    } catch (error) {
        console.error("Failed to parse BNPL requests from localStorage", error);
        setAllRequests([]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        try {
            localStorage.setItem(bnplStorageKey, JSON.stringify(allRequests));
        } catch (error) {
            console.error("Failed to write BNPL requests to localStorage", error);
        }
    }
  }, [allRequests, isInitialized]);
  
  const myRequests = useMemo(() => {
      return allRequests.filter(req => req.alias === alias);
  }, [allRequests, alias]);
  
  const currentCreditBalance = useMemo(() => {
    return myRequests
        .filter(req => req.status === 'approved')
        .reduce((total, req) => total + (req.amount - (req.repaidAmount || 0)), 0);
  }, [myRequests]);
  
  const kpis = useMemo(() => {
    const totalApprovedAmount = allRequests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingRequests = allRequests.filter(r => r.status === 'review').length;

    const decidedRequests = allRequests.filter(r => r.status === 'approved' || r.status === 'rejected').length;
    const approvedRequestsCount = allRequests.filter(r => r.status === 'approved').length;
    const approvalRate = decidedRequests > 0 ? (approvedRequestsCount / decidedRequests) * 100 : 0;
    
    return {
      totalApprovedAmount,
      pendingRequests,
      approvalRate
    };

  }, [allRequests]);


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
          repaidAmount: 0,
      };
      
      setAllRequests(prev => [...prev, newRequest]);
      
      if (assessmentResult.status === 'approved') {
          // Add the credit amount to the user's main balance.
          credit(amount);
          
          addTransaction({
              type: 'received',
              counterparty: `Crédit BNPL`,
              reason: `Crédit approuvé pour achat chez ${merchantAlias}`,
              amount,
              date: new Date().toISOString(),
              status: 'Terminé'
          });
      }

      return assessmentResult;
  };

  const updateRequestStatus = (id: string, status: 'approved' | 'rejected') => {
      const requestToUpdate = allRequests.find(r => r.id === id);
      if (!requestToUpdate) {
        console.error("BNPL request not found");
        return;
      }
      
      const wasInReview = requestToUpdate.status === 'review';

      setAllRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
      
      if (wasInReview && status === 'approved') {
        try {
            // This is a simulation since we can't reliably update other users' localStorage.
            // In a real app, this logic would be handled by a backend service.
            
            // 1. Give the user the loan amount as a transaction. They now "owe" this.
            // This is simulated by adding a transaction to their history. The actual debt is tracked in the request itself.
            const userTxKey = `paytik_transactions_${requestToUpdate.alias}`;
            const userTxStr = localStorage.getItem(userTxKey);
            const userTxs = userTxStr ? JSON.parse(userTxStr) : [];
            const userNewTx = {
                id: `TXN${Date.now()}`,
                type: 'received',
                counterparty: 'Crédit BNPL',
                reason: `Crédit approuvé pour ${requestToUpdate.merchantAlias}`,
                amount: requestToUpdate.amount,
                date: new Date().toISOString(),
                status: 'Terminé'
            };
            localStorage.setItem(userTxKey, JSON.stringify([userNewTx, ...userTxs]));

            // 2. Credit the merchant's balance for the sale
            const merchantBalanceKey = `paytik_balance_${requestToUpdate.merchantAlias}`;
            const merchantBalanceStr = localStorage.getItem(merchantBalanceKey);
            const merchantBalance = merchantBalanceStr ? JSON.parse(merchantBalanceStr) : 0;
            const newMerchantBalance = merchantBalance + requestToUpdate.amount;
            localStorage.setItem(merchantBalanceKey, JSON.stringify(newMerchantBalance));

            // 3. Add transaction for merchant to see the sale
            const merchantTxKey = `paytik_transactions_${requestToUpdate.merchantAlias}`;
            const merchantTxStr = localStorage.getItem(merchantTxKey);
            const merchantTxs = merchantTxStr ? JSON.parse(merchantTxStr) : [];
             const merchantNewTx = {
                id: `TXN${Date.now()+1}`,
                type: 'received',
                counterparty: `${requestToUpdate.alias}`,
                reason: `Paiement pour Achat BNPL`,
                amount: requestToUpdate.amount,
                date: new Date().toISOString(),
                status: 'Terminé'
            };
            localStorage.setItem(merchantTxKey, JSON.stringify([merchantNewTx, ...merchantTxs]));

            toast({ title: "Demande approuvée", description: `Le marchand ${requestToUpdate.merchantAlias} a été crédité et la dette de l'utilisateur a été enregistrée.` });

        } catch (error) {
            console.error("Failed to process manual BNPL approval:", error);
            toast({ title: "Erreur de traitement", description: "Une erreur est survenue lors de l'approbation.", variant: "destructive" });
            // Revert status on error
            setAllRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'review' } : req));
        }

      } else {
         toast({ title: `Demande ${status === 'approved' ? 'approuvée' : 'rejetée'}`, description: `La demande de ${requestToUpdate.alias} a été mise à jour.`})
      }
  }

  const repayCredit = (repaymentAmount: number) => {
    if(repaymentAmount <= 0 || repaymentAmount > currentCreditBalance) {
        toast({ title: "Montant invalide", variant: "destructive"});
        return;
    }
    if (repaymentAmount > balance) {
        toast({ title: "Solde principal insuffisant", variant: "destructive"});
        return;
    }

    debit(repaymentAmount);

    let remainingRepayment = repaymentAmount;
    const updatedRequests = allRequests.map(req => {
        if(req.alias === alias && req.status === 'approved' && (req.repaidAmount || 0) < req.amount && remainingRepayment > 0) {
            const due = req.amount - (req.repaidAmount || 0);
            const payment = Math.min(remainingRepayment, due);
            
            if (payment > 0) {
                req.repaidAmount = (req.repaidAmount || 0) + payment;
                remainingRepayment -= payment;
            }
        }
        return req;
    });

    setAllRequests(updatedRequests);
    
    addTransaction({
        type: 'sent',
        counterparty: 'PAYTIK Crédit',
        reason: 'Remboursement BNPL',
        amount: repaymentAmount,
        date: new Date().toISOString(),
        status: 'Terminé'
    });
    
    toast({ title: "Remboursement effectué", description: `Merci d'avoir remboursé ${repaymentAmount.toLocaleString()} Fcfa.` });
  }

  const value = { allRequests, myRequests, submitRequest, updateRequestStatus, currentCreditBalance, repayCredit, kpis };

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
