
"use client";

import { useState, useEffect, useCallback } from 'react';

export type ManagedUser = {
  name: string;
  email: string;
  alias: string;
  balance: number;
  avatar: string | null;
  isSuspended: boolean;
};

export const useUserManagement = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);

  const loadUsers = useCallback(() => {
    const loadedUsers: ManagedUser[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('paytik_user_')) {
        const alias = key.replace('paytik_user_', '');
        const userDataString = localStorage.getItem(key);
        const balanceDataString = localStorage.getItem(`paytik_balance_${alias}`);
        const avatarDataString = localStorage.getItem(`paytik_avatar_${alias}`);

        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            const balance = balanceDataString ? JSON.parse(balanceDataString) : 0;
            
            loadedUsers.push({
              name: userData.name,
              email: userData.email,
              alias: alias,
              balance: balance,
              avatar: avatarDataString || null,
              isSuspended: userData.isSuspended || false,
            });
          } catch (e) {
            console.error(`Failed to parse data for user ${alias}`, e);
          }
        }
      }
    }
    setUsers(loadedUsers);
  }, []);

  useEffect(() => {
    loadUsers();
    
    // Optional: listen to storage changes to auto-update
    window.addEventListener('storage', loadUsers);
    return () => {
        window.removeEventListener('storage', loadUsers);
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

  return { users, toggleUserSuspension, refreshUsers: loadUsers };
};
