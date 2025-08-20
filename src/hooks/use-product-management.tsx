
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from './use-toast';

export type ProductItem = {
    id: string;
    name: string;
    fee: number;
    commission: number;
    isActive: boolean;
    balance: number; // Represents money collected for this partner, to be settled.
};

type ProductContextType = {
    billers: ProductItem[];
    addBiller: (biller: Omit<ProductItem, 'id' | 'balance'>) => void;
    updateBiller: (id: string, data: Partial<Omit<ProductItem, 'id'>>) => void;
    removeBiller: (id: string) => void;
    settleBiller: (id: string, amount: number) => void;
    
    mobileMoneyOperators: ProductItem[];
    addMobileMoneyOperator: (operator: Omit<ProductItem, 'id' | 'balance'>) => void;
    updateMobileMoneyOperator: (id: string, data: Partial<Omit<ProductItem, 'id'>>) => void;
    removeMobileMoneyOperator: (id: string) => void;
    settleMobileMoneyOperator: (id: string, amount: number) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialBillers: ProductItem[] = [
    { id: "SENELEC", name: "SENELEC - Électricité", fee: 150, commission: 50, isActive: true, balance: 125000 },
    { id: "SDE", name: "SDE - Eau", fee: 150, commission: 50, isActive: true, balance: 89500 },
    { id: "Orange", name: "Orange - Internet / Mobile", fee: 0, commission: 10, isActive: true, balance: 210000 },
    { id: "Free", name: "Free - Internet / Mobile", fee: 0, commission: 12, isActive: true, balance: 150000 },
    { id: "Canal+", name: "Canal+ - TV", fee: 200, commission: 75, isActive: false, balance: 45000 },
];

const initialMobileMoneyOperators: ProductItem[] = [
    { id: "Wave", name: "Wave", fee: 0, commission: 15, isActive: true, balance: 350000 },
    { id: "Orange Money", name: "Orange Money", fee: 0, commission: 20, isActive: true, balance: 450000 },
    { id: "Free Money", name: "Free Money", fee: 0, commission: 18, isActive: true, balance: 200000 },
    { id: "Wizall", name: "Wizall Money", fee: 100, commission: 30, isActive: false, balance: 50000 },
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


  // --- Generic Handlers ---
  const handleAdd = (setter: React.Dispatch<React.SetStateAction<ProductItem[]>>, item: Omit<ProductItem, 'id' | 'balance'>) => {
    const newItem = { ...item, id: `${item.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`, balance: 0 };
    setter(prev => [...prev, newItem]);
    toast({ title: "Produit ajouté", description: `"${item.name}" a été ajouté.` });
  }

  const handleUpdate = (setter: React.Dispatch<React.SetStateAction<ProductItem[]>>, id: string, data: Partial<Omit<ProductItem, 'id'>>) => {
      setter(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      toast({ title: "Produit mis à jour", description: `"${data.name}" a été mis à jour.` });
  }

  const handleRemove = (setter: React.Dispatch<React.SetStateAction<ProductItem[]>>, id: string) => {
    setter(prev => prev.filter(b => b.id !== id));
    toast({ title: "Produit supprimé." });
  };
  
  const handleSettle = (setter: React.Dispatch<React.SetStateAction<ProductItem[]>>, id: string, amount: number) => {
      setter(prev => prev.map(item => {
          if (item.id === id) {
              if (amount > item.balance) {
                  toast({ title: "Erreur de règlement", description: "Le montant du règlement ne peut pas dépasser le solde dû.", variant: "destructive"});
                  return item;
              }
              toast({ title: "Règlement effectué", description: `${amount.toLocaleString()} Fcfa réglés pour ${item.name}.` });
              return { ...item, balance: item.balance - amount };
          }
          return item;
      }));
  }

  const value = { 
      billers, 
      addBiller: (biller) => handleAdd(setBillers, biller),
      updateBiller: (id, data) => handleUpdate(setBillers, id, data),
      removeBiller: (id) => handleRemove(setBillers, id),
      settleBiller: (id, amount) => handleSettle(setBillers, id, amount),
      
      mobileMoneyOperators,
      addMobileMoneyOperator: (operator) => handleAdd(setMobileMoneyOperators, operator),
      updateMobileMoneyOperator: (id, data) => handleUpdate(setMobileMoneyOperators, id, data),
      removeMobileMoneyOperator: (id) => handleRemove(setMobileMoneyOperators, id),
      settleMobileMoneyOperator: (id, amount) => handleSettle(setMobileMoneyOperators, id, amount),
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

    