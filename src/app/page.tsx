'use client';

import { useState, useEffect } from 'react';
import OnboardingDemo from '@/components/onboarding-demo';
import AliasCreation from '@/components/alias-creation';
import Dashboard from '@/components/dashboard';

type AppStep = 'demo' | 'alias' | 'dashboard';

export default function Home() {
  const [step, setStep] = useState<AppStep>('demo');
  const [alias, setAlias] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const onboarded = localStorage.getItem('paytik_onboarded') === 'true';
    const userAlias = localStorage.getItem('paytik_alias');
    if (onboarded && userAlias) {
      setAlias(userAlias);
      setStep('dashboard');
    }
  }, []);

  const handleAliasCreated = (newAlias: string) => {
    setAlias(newAlias);
    localStorage.setItem('paytik_onboarded', 'true');
    localStorage.setItem('paytik_alias', newAlias);
    setStep('dashboard');
  };
  
  const logout = () => {
    localStorage.removeItem('paytik_onboarded');
    localStorage.removeItem('paytik_alias');
    setAlias(null);
    setStep('demo');
  }

  const renderStep = () => {
    switch (step) {
      case 'demo':
        return <OnboardingDemo onComplete={() => setStep('alias')} />;
      case 'alias':
        return <AliasCreation onAliasCreated={handleAliasCreated} />;
      case 'dashboard':
        return <Dashboard alias={alias!} onLogout={logout} />;
      default:
        return <OnboardingDemo onComplete={() => setStep('alias')} />;
    }
  };
  
  if (!isClient) {
    return null;
  }

  return <main className="bg-background min-h-screen">{renderStep()}</main>;
}
