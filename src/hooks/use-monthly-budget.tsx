
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const monthlyBudgetStorageKey = 'midi_monthly_budget';

type MonthlyBudgetContextType = {
    budget: number;
    setBudget: (value: number) => void;
};

const MonthlyBudgetContext = createContext<MonthlyBudgetContextType | undefined>(undefined);

type MonthlyBudgetProviderProps = {
    children: ReactNode;
};

export const MonthlyBudgetProvider = ({ children }: MonthlyBudgetProviderProps) => {
    const [budget, setBudgetInternal] = useState<number>(0); // Default budget
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const storedBudget = localStorage.getItem(monthlyBudgetStorageKey);
            if (storedBudget) {
                setBudgetInternal(JSON.parse(storedBudget));
            }
        } catch(e) {
            console.error("Failed to read budget from localStorage", e);
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if(isInitialized) {
            try {
                localStorage.setItem(monthlyBudgetStorageKey, JSON.stringify(budget));
            } catch (e) {
                console.error("Failed to write budget to localStorage", e);
            }
        }
    }, [budget, isInitialized]);
    
    const setBudget = (value: number) => {
        setBudgetInternal(value);
    };

    return (
        <MonthlyBudgetContext.Provider value={{ budget, setBudget }}>
            {children}
        </MonthlyBudgetContext.Provider>
    );
};

export const useMonthlyBudget = () => {
    const context = useContext(MonthlyBudgetContext);
    if (context === undefined) {
        throw new Error('useMonthlyBudget must be used within a MonthlyBudgetProvider');
    }
    return context;
};
