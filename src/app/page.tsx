'use client';

import { useState, useEffect } from 'react';
import OnboardingDemo from '@/components/onboarding-demo';
import AliasCreation from '@/components/alias-creation';
import Dashboard from '@/components/dashboard';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AppStep = 'demo' | 'alias' | 'dashboard' | 'success';

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
    setStep('success');
  };
  
  const handleOnboardingComplete = () => {
    setStep('alias');
  };

  const handleSuccessContinue = () => {
    setStep('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('paytik_onboarded');
    localStorage.removeItem('paytik_alias');
    setAlias(null);
    setStep('demo');
  }

  const AliasCreationSuccess = () => (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-sm text-center shadow-xl animate-in fade-in zoom-in-95">
            <CardContent className="p-8">
                <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-lg font-semibold text-yellow-600">Bravo</p>
                <h2 className="text-2xl font-bold mt-2 mb-3">Votre alias est créé</h2>
                <p className="text-muted-foreground mb-8 text-sm">
                    Vous pouvez partager l'alias avec d'autres personnes pour leur permettre d'effectuer des transferts facilement sur votre compte. L'alias simplifie le processus et vous permet d'effectuer des transactions en toute simplicité.
                </p>
                <Button onClick={handleSuccessContinue} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-5">
                    Continuer
                </Button>
            </CardContent>
        </Card>
    </div>
  );


  const renderStep = () => {
    switch (step) {
      case 'demo':
        return <OnboardingDemo onComplete={handleOnboardingComplete} />;
      case 'alias':
        return <AliasCreation onAliasCreated={handleAliasCreated} />;
      case 'success':
        return <AliasCreationSuccess />;
      case 'dashboard':
        return <Dashboard alias={alias!} onLogout={logout} />;
      default:
        return <OnboardingDemo onComplete={handleOnboardingComplete} />;
    }
  };
  
  if (!isClient) {
    return null;
  }

  return <main className="bg-background min-h-screen">{renderStep()}</main>;
}
