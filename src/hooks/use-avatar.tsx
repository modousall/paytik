
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AvatarContextType = {
  avatar: string | null;
  setAvatar: (avatarDataUrl: string) => void;
};

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider = ({ children, alias }: { children: ReactNode, alias: string }) => {
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const storageKey = `paytik_avatar_${alias}`;

  useEffect(() => {
    try {
      const storedAvatar = localStorage.getItem(storageKey);
      if (storedAvatar) {
        setAvatarState(storedAvatar);
      } else {
        setAvatarState(null); // Reset for new user
      }
    } catch (error) {
        console.error("Failed to read avatar from localStorage", error);
    }
    setIsInitialized(true);
  }, [storageKey]);

  useEffect(() => {
    if (isInitialized) {
        if (avatar) {
            localStorage.setItem(storageKey, avatar);
        } else {
            localStorage.removeItem(storageKey);
        }
    }
  }, [avatar, isInitialized, storageKey]);

  const setAvatar = (avatarDataUrl: string) => {
    setAvatarState(avatarDataUrl);
    localStorage.setItem(storageKey, avatarDataUrl);
  };

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
