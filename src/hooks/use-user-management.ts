
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Transaction as UserTransaction } from './use-transactions';
import type { Vault } from './use-vaults';
import type { Tontine } from './use-tontine';
import type { CardDetails, CardTransaction } from './use-virtual-card';

export type ManagedUser = {
  name: string;
  email: string;
  alias: string;
  balance: number;
  avatar: string | null;
  isSuspended: boolean;
  role?: string;
};

// Exporting Transaction type to be used in other components
export type Transaction = UserTransaction;

export type ManagedUserWithTransactions = ManagedUser & {
    transactions: Transaction[];
}

export type ManagedUserWithDetails = ManagedUserWithTransactions & {
    vaults: Vault[];
    tontines: Tontine[];
    virtualCard: (CardDetails & { transactions: CardTransaction[] }) | null;
}

export type NewUserPayload = {
    name: string;
    email: string;
    alias: string;
    pincode: string;
    role: 'support' | 'admin';
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<ManagedUserWithDetails[]>([]);
  const [usersWithTransactions, setUsersWithTransactions] = useState<ManagedUserWithTransactions[]>([]);

  const loadUsers = useCallback(() => {
    const loadedUsersWithDetails: ManagedUserWithDetails[] = [];
    const loadedUsersWithTx: ManagedUserWithTransactions[] = [];

    if (typeof window === 'undefined') {
        return;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('paytik_user_')) {
        const alias = key.replace('paytik_user_', '');
        const userDataString = localStorage.getItem(key);
        
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);

            // Fetch all related data from localStorage
            const balanceDataString = localStorage.getItem(`paytik_balance_${alias}`);
            const avatarDataString = localStorage.getItem(`paytik_avatar_${alias}`);
            const transactionsDataString = localStorage.getItem(`paytik_transactions_${alias}`);
            const vaultsDataString = localStorage.getItem(`paytik_vaults_${alias}`);
            const tontinesDataString = localStorage.getItem(`paytik_tontines_${alias}`);
            const virtualCardDataString = localStorage.getItem(`paytik_virtual_card_${alias}`);
            const virtualCardTxDataString = localStorage.getItem(`paytik_virtual_card_txs_${alias}`);
            
            const balance = balanceDataString ? JSON.parse(balanceDataString) : 0;
            const transactions = transactionsDataString ? JSON.parse(transactionsDataString) : [];
            const vaults = vaultsDataString ? JSON.parse(vaultsDataString) : [];
            const tontines = tontinesDataString ? JSON.parse(tontinesDataString) : [];
            const virtualCardDetails = virtualCardDataString ? JSON.parse(virtualCardDataString) : null;
            const virtualCardTxs = virtualCardTxDataString ? JSON.parse(virtualCardTxDataString) : [];
            
            const virtualCard = virtualCardDetails ? { ...virtualCardDetails, transactions: virtualCardTxs } : null;

            const managedUser = {
              name: userData.name,
              email: userData.email,
              alias: alias,
              balance: balance,
              avatar: avatarDataString || null,
              isSuspended: userData.isSuspended || false,
              role: userData.role || 'user',
            };

            loadedUsersWithTx.push({ ...managedUser, transactions });
            loadedUsersWithDetails.push({ ...managedUser, transactions, vaults, tontines, virtualCard });

          } catch (e) {
            console.error(`Failed to parse data for user ${alias}`, e);
          }
        }
      }
    }
    setUsers(loadedUsersWithDetails);
    setUsersWithTransactions(loadedUsersWithTx);

  }, []);

  useEffect(() => {
    loadUsers();
    
    const handleStorageChange = () => loadUsers();
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }

  }, [loadUsers]);

  const updateUserProperty = (alias: string, update: (userData: any) => void) => {
    const userKey = `paytik_user_${alias}`;
    const userDataString = localStorage.getItem(userKey);
    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            update(userData);
            localStorage.setItem(userKey, JSON.stringify(userData));
            loadUsers(); // Refresh state for all components
        } catch(e) {
            console.error(`Failed to update data for user ${alias}`, e);
        }
    }
  };

  const toggleUserSuspension = (alias: string, suspend: boolean) => {
    updateUserProperty(alias, userData => {
        userData.isSuspended = suspend;
    });
  };

  const resetUserPin = (alias: string, newPin: string) => {
     updateUserProperty(alias, userData => {
        userData.pincode = newPin;
    });
  };

  const updateUserRole = (alias: string, newRole: string) => {
    updateUserProperty(alias, userData => {
      userData.role = newRole;
    });
  };

  const addUser = (payload: NewUserPayload): { success: boolean, message: string } => {
    const userKey = `paytik_user_${payload.alias}`;
    if (localStorage.getItem(userKey)) {
        return { success: false, message: "Cet alias est déjà utilisé." };
    }

    const newUser = {
        name: payload.name,
        email: payload.email,
        pincode: payload.pincode,
        role: payload.role,
        isSuspended: false,
    };

    localStorage.setItem(userKey, JSON.stringify(newUser));
    // Initialize other user-related data
    localStorage.setItem(`paytik_balance_${payload.alias}`, '0');
    localStorage.setItem(`paytik_transactions_${payload.alias}`, '[]');
    localStorage.setItem(`paytik_contacts_${payload.alias}`, '[]');
    localStorage.setItem(`paytik_vaults_${payload.alias}`, '[]');
    localStorage.setItem(`paytik_tontines_${payload.alias}`, '[]');
    
    loadUsers(); // Force reload of all users to reflect change
    return { success: true, message: "Utilisateur créé avec succès." };
  };

  return { users, usersWithTransactions, toggleUserSuspension, resetUserPin, addUser, updateUserRole, refreshUsers: loadUsers };
};

    

    
