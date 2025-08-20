
'use client';

import { useState, useEffect } from 'react';
import OnboardingDemo from '@/components/onboarding-demo';
import AliasCreation from '@/components/alias-creation';
import Dashboard from '@/components/dashboard';
import PermissionsRequest from '@/components/permissions-request';
import LoginForm from '@/components/login-form';
import KYCForm from '@/components/kyc-form';
import { useToast } from '@/hooks/use-toast';


type UserInfo = {
  name: string;
  email: string;
};

type AppStep = 'demo' | 'permissions' | 'login' | 'kyc' | 'alias' | 'dashboard';


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

    if (onboarded && userAlias && userName && userEmail) {
      setAlias(userAlias);
      setUserInfo({name: userName, email: userEmail});
      setStep('dashboard');
    }
  }, []);

  const handleAliasCreated = (newAlias: string) => {
    setAlias(newAlias);
    localStorage.setItem('paytik_onboarded', 'true');
    localStorage.setItem('paytik_alias', newAlias);
    if(userInfo){
        localStorage.setItem('paytik_username', userInfo.name);
        localStorage.setItem('paytik_useremail', userInfo.email);
    }
    setStep('dashboard');
  };
  
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

  const handleLogin = (loginAlias: string) => {
    const storedAlias = localStorage.getItem('paytik_alias');
    const storedName = localStorage.getItem('paytik_username');
    const storedEmail = localStorage.getItem('paytik_useremail');
  
    if (loginAlias === storedAlias && storedName && storedEmail) {
      setAlias(loginAlias);
      setUserInfo({ name: storedName, email: storedEmail });
      setStep('dashboard');
      toast({
        title: `Bienvenue, ${storedName} !`,
        description: "Connexion réussie.",
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
    localStorage.removeItem('paytik_onboarded');
    localStorage.removeItem('paytik_alias');
    localStorage.removeItem('paytik_username');
    localStorage.removeItem('paytik_useremail');
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
      case 'dashboard':
        return <Dashboard alias={alias!} userInfo={userInfo!} onLogout={logout} />;
      default:
        return <OnboardingDemo onStart={handleOnboardingStart} onLogin={handleLoginStart} />;
    }
  };
  
  if (!isClient) {
    return null; // Render nothing on the server to avoid hydration mismatch
  }

  return <main className="bg-background min-h-screen">{renderStep()}</main>;
}
