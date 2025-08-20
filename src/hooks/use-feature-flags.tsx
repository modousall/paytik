
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ManagedUserWithDetails } from './use-user-management';

export type Feature = 'virtualCards' | 'tontine' | 'bnpl';
export type FeatureFlags = Record<Feature, boolean>;

export const defaultFlags: FeatureFlags = {
    virtualCards: true,
    tontine: true,
    bnpl: true,
};

type FeatureFlagContextType = {
    flags: FeatureFlags;
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

type FeatureFlagProviderProps = {
    children: ReactNode;
    alias: string;
    initialFlags?: FeatureFlags;
};

export const FeatureFlagProvider = ({ children, alias, initialFlags }: FeatureFlagProviderProps) => {
    const [flags, setFlags] = useState<FeatureFlags>(initialFlags || defaultFlags);

    // This provider now gets its state from the parent context (e.g., useUserManagement)
    // or from the main app state. The logic to *change* flags is handled in useUserManagement.
    // This hook is now primarily for *reading* the flags for the current user.

    React.useEffect(() => {
        // If initialFlags are provided (e.g. from AdminUserDetail), use them.
        if (initialFlags) {
            setFlags(initialFlags);
            return;
        }

        // Otherwise, load from the specific user's data in localStorage for the main app.
        const userKey = `paytik_user_${alias}`;
        try {
            const userDataString = localStorage.getItem(userKey);
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setFlags(userData.featureFlags || defaultFlags);
            } else {
                setFlags(defaultFlags);
            }
        } catch (error) {
            console.error("Failed to read feature flags from localStorage for user", alias, error);
            setFlags(defaultFlags);
        }
    }, [alias, initialFlags]);


    return (
        <FeatureFlagContext.Provider value={{ flags }}>
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
