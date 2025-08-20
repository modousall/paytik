
'use client';

import { useState, useEffect } from 'react';
import OnboardingDemo from '@/components/onboarding-demo';
import AliasCreation from '@/components/alias-creation';
import Dashboard from '@/components/dashboard';
import PermissionsRequest from '@/components/permissions-request';
import LoginForm from '@/components/login-form';
import KYCForm from '@/components/kyc-form';
import PinCreation from '@/components/pin-creation';
import { useToast } from '@/hooks/use-toast';


type UserInfo = {
  name: string;
  email: string;
};

type AppStep = 'demo' | 'permissions' | 'login' | 'kyc' | 'alias' | 'pin_creation' | 'dashboard';


export default function Home() {
  const [step, setStep] = useState<AppStep>('demo');
  const [alias, setAlias] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const onboarded = localStorage.getItem('paytik_onboarded') === 'true';
    const userAlias = localStorage.getItem('paytik_alias');
    const userName = localStorage.getItem('paytik_username');
    const userEmail = localStorage.getItem('paytik_useremail');
    const pinExists = !!localStorage.getItem('paytik_pincode');

    if (onboarded && userAlias && userName && userEmail && pinExists) {
      setAlias(userAlias);
      setUserInfo({name: userName, email: userEmail});
      // Skip login for already onboarded users for demo purposes
      // In a real app you'd always show the login form
      setStep('dashboard'); 
    }
  }, []);

  const handleAliasCreated = (newAlias: string) => {
    setAlias(newAlias);
    setStep('pin_creation');
  };

  const handlePinCreated = (pin: string) => {
    localStorage.setItem('paytik_onboarded', 'true');
    if (alias) localStorage.setItem('paytik_alias', alias);
    if (userInfo) {
        localStorage.setItem('paytik_username', userInfo.name);
        localStorage.setItem('paytik_useremail', userInfo.email);
    }
    localStorage.setItem('paytik_pincode', pin);
    setStep('dashboard');
  }
  
  const handleOnboardingStart = () => {
    setStep('permissions');
  };

  const handlePermissionsGranted = () => {
    setStep('kyc');
  };

  const handleLoginStart = () => {
    setStep('login');
  };
  
  const handleKycComplete = (info: UserInfo) => {
    setUserInfo(info);
    setStep('alias');
  };

  const handleLogin = (loginAlias: string, pin: string) => {
    const storedAlias = localStorage.getItem('paytik_alias');
    const storedPin = localStorage.getItem('paytik_pincode');
    const storedName = localStorage.getItem('paytik_username');
    const storedEmail = localStorage.getItem('paytik_useremail');
  
    if (loginAlias === storedAlias && pin === storedPin) {
      if (storedName && storedEmail) {
        setAlias(loginAlias);
        setUserInfo({ name: storedName, email: storedEmail });
        setStep('dashboard');
        toast({
          title: `Bienvenue, ${storedName} !`,
          description: "Connexion réussie.",
        });
      } else {
        // This case should not happen in normal flow, but it's a good safeguard
        toast({
          title: "Erreur de compte",
          description: "Les informations de votre compte sont incomplètes. Veuillez vous réinscrire.",
          variant: "destructive",
        });
      }
    } else if (loginAlias === storedAlias && pin !== storedPin) {
        toast({
            title: "Code PIN incorrect",
            description: "Le code PIN que vous avez saisi est incorrect. Veuillez réessayer.",
            variant: "destructive",
        });
    } else {
      toast({
        title: "Alias non trouvé",
        description: "Cet alias n'existe pas. Veuillez vérifier l'alias ou créer un nouveau compte.",
        variant: "destructive",
      });
    }
  }

  const logout = () => {
    // We don't clear localStorage here so the user can log back in.
    // In a real app, you might want to clear it depending on security requirements.
    setAlias(null);
    setUserInfo(null); 
    setStep('demo');
  }

  const renderStep = () => {
    switch (step) {
      case 'demo':
        return <OnboardingDemo onStart={handleOnboardingStart} onLogin={handleLoginStart} />;
      case 'permissions':
        return <PermissionsRequest onPermissionsGranted={handlePermissionsGranted} />;
      case 'login':
        return <LoginForm onLogin={handleLogin} onBack={() => setStep('demo')} />;
      case 'kyc':
        return <KYCForm onKycComplete={handleKycComplete} />;
      case 'alias':
        return <AliasCreation onAliasCreated={handleAliasCreated} userInfo={userInfo} />;
      case 'pin_creation':
        return <PinCreation onPinCreated={handlePinCreated} />;
      case 'dashboard':
        return <Dashboard alias={alias!} userInfo={userInfo!} onLogout={logout} />;
      default:
        return <OnboardingDemo onStart={handleOnboardingStart} onLogin={handleLoginStart} />;
    }
  };
  
  if (!isClient) {
    return null;
  }

  return <main className="bg-background min-h-screen">{renderStep()}</main>;
}
