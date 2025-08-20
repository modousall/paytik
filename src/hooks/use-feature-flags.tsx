
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Feature = 'virtualCards' | 'tontine' | 'bnpl';

export type FeatureFlags = Record<Feature, boolean>;

const defaultFlags: FeatureFlags = {
    virtualCards: true,
    tontine: true,
    bnpl: true,
};

type FeatureFlagContextType = {
    flags: FeatureFlags;
    toggleFlag: (flag: Feature) => void;
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

const storageKey = 'paytik_feature_flags';

export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
    const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const storedFlags = localStorage.getItem(storageKey);
            if (storedFlags) {
                // Merge stored flags with defaults to ensure new flags are added
                const parsedFlags = JSON.parse(storedFlags);
                setFlags({ ...defaultFlags, ...parsedFlags });
            } else {
                setFlags(defaultFlags);
                localStorage.setItem(storageKey, JSON.stringify(defaultFlags));
            }
        } catch (error) {
            console.error("Failed to read feature flags from localStorage", error);
            setFlags(defaultFlags);
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(storageKey, JSON.stringify(flags));
        }
    }, [flags, isInitialized]);

    const toggleFlag = (flag: Feature) => {
        setFlags(prevFlags => ({
            ...prevFlags,
            [flag]: !prevFlags[flag],
        }));
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, toggleFlag }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
    }
    return context;
};
