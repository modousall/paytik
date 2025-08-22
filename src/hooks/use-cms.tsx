
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CmsContent = {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  features: {
    id: string;
    href: string;
    title: string;
    description: string;
  }[];
  images: {
    financing: string;
    savings: string;
    payments: string;
    security: string;
  };
};

export const defaultContent: CmsContent = {
  hero: {
    title: "Midi",
    subtitle: "Microfinance Islamique Digitale et Inclusive.",
    description: "Gérez votre argent, financez vos projets et épargnez en toute sérénité.",
  },
  features: [
    {
      id: "financing",
      href: "/financing",
      title: "Financement Conforme",
      description: "Financez vos projets et achats (Mourabaha) en accord avec les principes éthiques.",
    },
    {
      id: "savings",
      href: "/savings",
      title: "Épargne & Tontine",
      description: "Constituez votre épargne dans des coffres ou participez à des tontines collaboratives.",
    },
    {
      id: "payments",
      href: "/payments",
      title: "Paiements Éthiques",
      description: "Envoyez et recevez de l'argent instantanément, avec des frais justes et transparents.",
    },
    {
      id: "security",
      href: "/security",
      title: "Sécurité & Conformité",
      description: "Vos transactions sont protégées et conformes aux plus hauts standards de sécurité.",
    },
  ],
  images: {
    financing: "https://placehold.co/600x400.png",
    savings: "https://placehold.co/600x400.png",
    payments: "https://placehold.co/600x400.png",
    security: "https://placehold.co/600x400.png",
  }
};

const cmsStorageKey = 'midi_cms_content';

type CmsContextType = {
  content: CmsContent;
  setContent: (newContent: CmsContent) => void;
};

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export const CmsProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContentState] = useState<CmsContent>(defaultContent);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedContent = localStorage.getItem(cmsStorageKey);
      if (storedContent) {
        const parsed = JSON.parse(storedContent);
        // Merge with default to avoid missing keys if structure changed
        setContentState({
          ...defaultContent,
          ...parsed,
          hero: { ...defaultContent.hero, ...parsed.hero },
          features: parsed.features || defaultContent.features,
          images: { ...defaultContent.images, ...parsed.images }
        });
      }
    } catch (error) {
      console.error("Failed to read CMS content from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(cmsStorageKey, JSON.stringify(content));
      } catch (error) {
        console.error("Failed to write CMS content to localStorage", error);
      }
    }
  }, [content, isInitialized]);

  const setContent = (newContent: CmsContent) => {
    setContentState(newContent);
  };

  return (
    <CmsContext.Provider value={{ content, setContent }}>
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (context === undefined) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
