
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AvatarContextType = {
  avatar: string | null;
  setAvatar: (avatarDataUrl: string) => void;
};

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider = ({ children }: { children: ReactNode }) => {
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedAvatar = localStorage.getItem('paytik_avatar');
      if (storedAvatar) {
        setAvatarState(storedAvatar);
      }
    } catch (error) {
        console.error("Failed to read avatar from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && avatar) {
        localStorage.setItem('paytik_avatar', avatar);
    }
  }, [avatar, isInitialized]);

  const setAvatar = (avatarDataUrl: string) => {
    setAvatarState(avatarDataUrl);
    // Also save to local storage immediately
    localStorage.setItem('paytik_avatar', avatarDataUrl);
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
