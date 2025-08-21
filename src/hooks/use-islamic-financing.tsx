
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { islamicFinancingAssessment } from '@/ai/flows/islamic-financing-flow';
import { useTransactions } from './use-transactions';
import { useBalance } from './use-balance';
import { toast } from './use-toast';
import type { FinancingRequest, FinancingStatus, IslamicFinancingOutput, IslamicFinancingInput } from '@/lib/types';
import { useUserManagement } from './use-user-management';

type SubmitRequestPayload = {
    financingType: string;
    amount: number;
    durationMonths: number;
    purpose: string;
};

type IslamicFinancingContextType = {
  allRequests: FinancingRequest[];
  myRequests: FinancingRequest[];
  submitRequest: (payload: SubmitRequestPayload) => Promise<IslamicFinancingOutput>;
  updateRequestStatus: (id: string, status: 'approved' | 'rejected') => void;
};

const IslamicFinancingContext = createContext<IslamicFinancingContextType | undefined>(undefined);

const financingStorageKey = 'midi_financing_requests';

type IslamicFinancingProviderProps = {
    children: ReactNode;
    alias: string;
};

export const IslamicFinancingProvider = ({ children, alias }: IslamicFinancingProviderProps) => {
  const [allRequests, setAllRequests] = useState<FinancingRequest[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { transactions } = useTransactions();
  const { balance, credit } = useBalance();

  useEffect(() => {
    try {
      const storedRequests = localStorage.getItem(financingStorageKey);
      if (storedRequests) {
        setAllRequests(JSON.parse(storedRequests));
      }
    } catch (error) {
        console.error("Failed to parse Financing requests from localStorage", error);
        setAllRequests([]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        try {
            localStorage.setItem(financingStorageKey, JSON.stringify(allRequests));
        } catch (error) {
            console.error("Failed to write Financing requests to localStorage", error);
        }
    }
  }, [allRequests, isInitialized]);
  
  const myRequests = useMemo(() => {
      return allRequests.filter(req => req.alias === alias);
  }, [allRequests, alias]);
  
  const submitRequest = async (payload: SubmitRequestPayload): Promise<IslamicFinancingOutput> => {
      const transactionHistory = transactions.slice(0, 10).map(t => ({ amount: t.amount, type: t.type, date: t.date }));

      const assessmentInput: IslamicFinancingInput = {
        alias,
        financingType: payload.financingType,
        amount: payload.amount,
        durationMonths: payload.durationMonths,
        purpose: payload.purpose,
        currentBalance: balance,
        transactionHistory,
      }

      const assessmentResult = await islamicFinancingAssessment(assessmentInput);

      const newRequest: FinancingRequest = {
          id: `fin-${Date.now()}`,
          alias,
          ...payload,
          status: assessmentResult.status,
          reason: assessmentResult.reason,
          repaymentPlan: assessmentResult.repaymentPlan,
          requestDate: new Date().toISOString(),
      };
      
      setAllRequests(prev => [...prev, newRequest]);
      
      if (assessmentResult.status === 'approved') {
          credit(payload.amount);
      }

      return assessmentResult;
  };

  const updateRequestStatus = (id: string, status: 'approved' | 'rejected') => {
      const requestToUpdate = allRequests.find(r => r.id === id);
      if (!requestToUpdate) {
        console.error("Financing request not found");
        return;
      }
      
      setAllRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
      
      toast({ title: `Demande ${status === 'approved' ? 'approuvée' : 'rejetée'}`, description: `La demande de financement de ${requestToUpdate.alias} a été mise à jour.`})
  }
  
  const value = { allRequests, myRequests, submitRequest, updateRequestStatus };

  return (
    <IslamicFinancingContext.Provider value={value}>
      {children}
    </IslamicFinancingContext.Provider>
  );
};

export const useIslamicFinancing = () => {
  const context = useContext(IslamicFinancingContext);
  if (context === undefined) {
    throw new Error('useIslamicFinancing must be used within a IslamicFinancingProvider');
  }
  return context;
};
