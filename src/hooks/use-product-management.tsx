
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ProductItem = {
    id: string;
    name: string;
};

type ProductContextType = {
    billers: ProductItem[];
    addBiller: (biller: Omit<ProductItem, 'id'>) => void;
    removeBiller: (id: string) => void;
    mobileMoneyOperators: ProductItem[];
    addMobileMoneyOperator: (operator: Omit<ProductItem, 'id'>) => void;
    removeMobileMoneyOperator: (id: string) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialBillers: ProductItem[] = [
    { id: "SENELEC", name: "SENELEC - Électricité" },
    { id: "SDE", name: "SDE - Eau" },
    { id: "Orange", name: "Orange - Internet / Mobile" },
    { id: "Free", name: "Free - Internet / Mobile" },
    { id: "Canal+", name: "Canal+ - TV" },
];

const initialMobileMoneyOperators: ProductItem[] = [
    { id: "Wave", name: "Wave" },
    { id: "Orange Money", name: "Orange Money" },
    { id: "Free Money", name: "Free Money" },
    { id: "Wizall", name: "Wizall Money" },
];

const billersStorageKey = 'paytik_product_billers';
const operatorsStorageKey = 'paytik_product_operators';

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [billers, setBillers] = useState<ProductItem[]>([]);
  const [mobileMoneyOperators, setMobileMoneyOperators] = useState<ProductItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedBillers = localStorage.getItem(billersStorageKey);
      setBillers(storedBillers ? JSON.parse(storedBillers) : initialBillers);

      const storedOperators = localStorage.getItem(operatorsStorageKey);
      setMobileMoneyOperators(storedOperators ? JSON.parse(storedOperators) : initialMobileMoneyOperators);
    } catch (error) {
        console.error("Failed to parse products from localStorage", error);
        setBillers(initialBillers);
        setMobileMoneyOperators(initialMobileMoneyOperators);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem(billersStorageKey, JSON.stringify(billers));
    }
  }, [billers, isInitialized]);
  
  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem(operatorsStorageKey, JSON.stringify(mobileMoneyOperators));
    }
  }, [mobileMoneyOperators, isInitialized]);

  const addBiller = (biller: Omit<ProductItem, 'id'>) => {
    const newBiller = { ...biller, id: `biller-${Date.now()}` };
    setBillers(prev => [...prev, newBiller]);
  };

  const removeBiller = (id: string) => {
    setBillers(prev => prev.filter(b => b.id !== id));
  };
  
  const addMobileMoneyOperator = (operator: Omit<ProductItem, 'id'>) => {
    const newOperator = { ...operator, id: `op-${Date.now()}` };
    setMobileMoneyOperators(prev => [...prev, newOperator]);
  };
  
  const removeMobileMoneyOperator = (id: string) => {
    setMobileMoneyOperators(prev => prev.filter(op => op.id !== id));
  };

  const value = { 
      billers, 
      addBiller, 
      removeBiller,
      mobileMoneyOperators,
      addMobileMoneyOperator,
      removeMobileMoneyOperator,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductManagement = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductManagement must be used within a ProductProvider');
  }
  return context;
};
