
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Feature = 'virtualCards' | 'tontine' | 'bnpl';
export type FeatureFlags = Record<Feature, boolean>;

export const defaultFlags: FeatureFlags = {
    virtualCards: true,
    tontine: true,
    bnpl: true,
};

const featureFlagsStorageKey = 'paytik_feature_flags';

type FeatureFlagContextType = {
    flags: FeatureFlags;
    setFlag: (feature: Feature, value: boolean) => void;
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

type FeatureFlagProviderProps = {
    children: ReactNode;
};

export const FeatureFlagProvider = ({ children }: FeatureFlagProviderProps) => {
    const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const storedFlags = localStorage.getItem(featureFlagsStorageKey);
            if (storedFlags) {
                setFlags(JSON.parse(storedFlags));
            } else {
                setFlags(defaultFlags);
            }
        } catch(e) {
            console.error("Failed to read feature flags", e);
            setFlags(defaultFlags);
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if(isInitialized) {
            try {
                localStorage.setItem(featureFlagsStorageKey, JSON.stringify(flags));
            } catch (e) {
                console.error("Failed to write feature flags to localStorage", e);
            }
        }
    }, [flags, isInitialized]);
    

    const setFlag = (feature: Feature, value: boolean) => {
        setFlags(prevFlags => ({
            ...prevFlags,
            [feature]: value,
        }));
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, setFlag }}>
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
