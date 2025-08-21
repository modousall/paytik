
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { assessBnplApplication } from '@/ai/flows/bnpl-assessment-flow';
import { useTransactions } from './use-transactions';
import { useBalance } from './use-balance';
import { toast } from './use-toast';
import type { BnplRequest, BnplAssessmentOutput, BnplAssessmentInput } from '@/lib/types';
import { useUserManagement } from './use-user-management';

type SubmitRequestPayload = {
    merchantAlias: string;
    amount: number;
    downPayment?: number;
    installmentsCount: number;
    marginRate: number;
    repaymentFrequency: string;
    firstInstallmentDate: string;
};

type BnplContextType = {
  allRequests: BnplRequest[];
  myRequests: BnplRequest[];
  currentCreditBalance: number;
  kpis: {
    totalApprovedAmount: number;
    pendingRequests: number;
    approvalRate: number;
  };
  submitRequest: (payload: SubmitRequestPayload) => Promise<BnplAssessmentOutput>;
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
  const { users } = useUserManagement();

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


  const submitRequest = async (payload: SubmitRequestPayload): Promise<BnplAssessmentOutput> => {
      const transactionHistory = transactions.slice(0, 10).map(t => ({ amount: t.amount, type: t.type, date: t.date }));

      const assessmentInput: BnplAssessmentInput = {
        alias,
        purchaseAmount: payload.amount,
        downPayment: payload.downPayment,
        currentBalance: balance,
        transactionHistory,
        installmentsCount: payload.installmentsCount,
        marginRate: payload.marginRate,
        repaymentFrequency: payload.repaymentFrequency,
        firstInstallmentDate: payload.firstInstallmentDate,
      }

      const assessmentResult = await assessBnplApplication(assessmentInput);

      const newRequest: BnplRequest = {
          id: `bnpl-${Date.now()}`,
          alias,
          merchantAlias: payload.merchantAlias,
          amount: payload.amount - (payload.downPayment || 0),
          status: assessmentResult.status,
          reason: assessmentResult.reason,
          repaymentPlan: assessmentResult.repaymentPlan,
          requestDate: new Date().toISOString(),
          repaidAmount: 0,
      };
      
      setAllRequests(prev => [...prev, newRequest]);
      
      if (assessmentResult.status === 'approved') {
          // Pay the down payment immediately
          if(payload.downPayment && payload.downPayment > 0) {
            debit(payload.downPayment);
            addTransaction({
              type: 'sent',
              counterparty: payload.merchantAlias,
              reason: `Avance pour achat BNPL`,
              amount: payload.downPayment,
              date: new Date().toISOString(),
              status: 'Terminé'
            });
          }

          // Credit the user with the financed amount
          const financedAmount = payload.amount - (payload.downPayment || 0);
          credit(financedAmount);
          addTransaction({
              type: 'received',
              counterparty: 'Credit Marchands',
              reason: `Crédit approuvé pour achat chez ${payload.merchantAlias}`,
              amount: financedAmount,
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
            const userToCredit = users.find(u => u.alias === requestToUpdate.alias);
            const merchantToPay = users.find(u => u.alias === requestToUpdate.merchantAlias);

            if (!userToCredit || !merchantToPay) {
                throw new Error("Utilisateur ou marchand introuvable pour la transaction BNPL.");
            }

            // This is a simulation, in a real app this would be a multi-step backend transaction.
            
            // 1. Credit the user's balance
            const userBalanceKey = `paytik_balance_${userToCredit.alias}`;
            const userNewBalance = (userToCredit.balance || 0) + requestToUpdate.amount;
            localStorage.setItem(userBalanceKey, JSON.stringify(userNewBalance));

            // 2. Add transaction for user to see the credit
            const userTxKey = `paytik_transactions_${userToCredit.alias}`;
            const userTxStr = localStorage.getItem(userTxKey);
            const userTxs = userTxStr ? JSON.parse(userTxStr) : [];
            const userNewTx = {
                id: `TXN${Date.now()}`,
                type: 'received',
                counterparty: 'Credit Marchands',
                reason: `Crédit approuvé pour ${merchantToPay.name}`,
                amount: requestToUpdate.amount,
                date: new Date().toISOString(),
                status: 'Terminé'
            };
            localStorage.setItem(userTxKey, JSON.stringify([userNewTx, ...userTxs]));

            // 3. Immediately debit the user for the payment to the merchant
            const userFinalBalance = userNewBalance - requestToUpdate.amount;
            localStorage.setItem(userBalanceKey, JSON.stringify(userFinalBalance));
            const userPaymentTx = {
                 id: `TXN${Date.now()+1}`,
                 type: 'sent',
                 counterparty: merchantToPay.alias,
                 reason: `Achat chez ${merchantToPay.name}`,
                 amount: requestToUpdate.amount,
                 date: new Date().toISOString(),
                 status: 'Terminé'
            }
             localStorage.setItem(userTxKey, JSON.stringify([userPaymentTx, userNewTx, ...userTxs]));


            // 4. Credit the merchant's balance
            const merchantBalanceKey = `paytik_balance_${merchantToPay.alias}`;
            const newMerchantBalance = (merchantToPay.balance || 0) + requestToUpdate.amount;
            localStorage.setItem(merchantBalanceKey, JSON.stringify(newMerchantBalance));

            // 5. Add transaction for merchant to see the sale
            const merchantTxKey = `paytik_transactions_${merchantToPay.alias}`;
            const merchantTxStr = localStorage.getItem(merchantTxKey);
            const merchantTxs = merchantTxStr ? JSON.parse(merchantTxStr) : [];
             const merchantNewTx = {
                id: `TXN${Date.now()+2}`,
                type: 'received',
                counterparty: userToCredit.alias,
                reason: `Paiement pour Achat BNPL de ${userToCredit.alias}`,
                amount: requestToUpdate.amount,
                date: new Date().toISOString(),
                status: 'Terminé'
            };
            localStorage.setItem(merchantTxKey, JSON.stringify([merchantNewTx, ...merchantTxs]));

            toast({ title: "Demande approuvée", description: `Le marchand ${requestToUpdate.merchantAlias} a été crédité et la dette de l'utilisateur a été enregistrée.` });

        } catch (error: any) {
            console.error("Failed to process manual BNPL approval:", error);
            toast({ title: "Erreur de traitement", description: error.message || "Une erreur est survenue lors de l'approbation.", variant: "destructive" });
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
        counterparty: 'Credit Marchands',
        reason: 'Remboursement',
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

    