
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Transaction as UserTransaction } from './use-transactions';

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

export const useUserManagement = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usersWithTransactions, setUsersWithTransactions] = useState<ManagedUserWithTransactions[]>([]);

  const loadUsers = useCallback(() => {
    const loadedUsers: ManagedUser[] = [];
    const loadedUsersWithTx: ManagedUserWithTransactions[] = [];

    if (typeof window === 'undefined') {
        return;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('paytik_user_')) {
        const alias = key.replace('paytik_user_', '');
        const userDataString = localStorage.getItem(key);
        const balanceDataString = localStorage.getItem(`paytik_balance_${alias}`);
        const avatarDataString = localStorage.getItem(`paytik_avatar_${alias}`);
        const transactionsDataString = localStorage.getItem(`paytik_transactions_${alias}`);

        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            const balance = balanceDataString ? JSON.parse(balanceDataString) : 0;
            const transactions = transactionsDataString ? JSON.parse(transactionsDataString) : [];
            
            const managedUser = {
              name: userData.name,
              email: userData.email,
              alias: alias,
              balance: balance,
              avatar: avatarDataString || null,
              isSuspended: userData.isSuspended || false,
              role: userData.role || 'user'
            };

            loadedUsers.push(managedUser);
            loadedUsersWithTx.push({ ...managedUser, transactions });

          } catch (e) {
            console.error(`Failed to parse data for user ${alias}`, e);
          }
        }
      }
    }
    setUsers(loadedUsers);
    setUsersWithTransactions(loadedUsersWithTx);

  }, []);

  useEffect(() => {
    loadUsers();
    
    // Optional: listen to storage changes to auto-update
    const handleStorageChange = () => loadUsers();
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }

  }, [loadUsers]);

  const toggleUserSuspension = (alias: string, suspend: boolean) => {
    const userKey = `paytik_user_${alias}`;
    const userDataString = localStorage.getItem(userKey);
    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            userData.isSuspended = suspend;
            localStorage.setItem(userKey, JSON.stringify(userData));
            // Reload users to reflect the change in the UI
            loadUsers();
        } catch(e) {
            console.error(`Failed to update suspension status for user ${alias}`, e);
        }
    }
  };

  return { users, usersWithTransactions, toggleUserSuspension, refreshUsers: loadUsers };
};
