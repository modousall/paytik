
'use client';

import { useState, useEffect, ReactNode } from 'react';
import OnboardingDemo from '@/components/onboarding-demo';
import AliasCreation from '@/components/alias-creation';
import Dashboard from '@/components/dashboard';
import PermissionsRequest from '@/components/permissions-request';
import LoginForm from '@/components/login-form';
import KYCForm from '@/components/kyc-form';
import PinCreation from '@/components/pin-creation';
import { useToast } from '@/hooks/use-toast';

import { TransactionsProvider } from '@/hooks/use-transactions';
import { ContactsProvider } from '@/hooks/use-contacts';
import { VirtualCardProvider } from '@/hooks/use-virtual-card';
import { TontineProvider } from '@/hooks/use-tontine';
import { VaultsProvider } from '@/hooks/use-vaults';
import { BalanceProvider } from '@/hooks/use-balance';
import { AvatarProvider } from '@/hooks/use-avatar';

type UserInfo = {
  name: string;
  email: string;
};

type AppStep = 'demo' | 'permissions' | 'login' | 'kyc' | 'alias' | 'pin_creation' | 'dashboard';


// This new component will wrap all providers and ensure they are initialized
// with the correct user alias.
const AppProviders = ({ alias, children }: { alias: string; children: ReactNode }) => {
    return (
        <AvatarProvider alias={alias}>
            <BalanceProvider alias={alias}>
              <TransactionsProvider alias={alias}>
                <ContactsProvider alias={alias}>
                  <VirtualCardProvider alias={alias}>
                    <TontineProvider alias={alias}>
                      <VaultsProvider alias={alias}>
                        {children}
                      </VaultsProvider>
                    </TontineProvider>
                  </VirtualCardProvider>
                </ContactsProvider>
              </TransactionsProvider>
            </BalanceProvider>
        </AvatarProvider>
    )
}

export default function Home() {
  const [step, setStep] = useState<AppStep>('demo');
  const [alias, setAlias] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const lastAlias = localStorage.getItem('paytik_last_alias');
    if (lastAlias) {
        const userDataString = localStorage.getItem(`paytik_user_${lastAlias}`);
        if(userDataString) {
            const userData = JSON.parse(userDataString);
            setAlias(lastAlias);
            setUserInfo({ name: userData.name, email: userData.email });
            setStep('dashboard'); // Go directly to dashboard
        } else {
            // User data is missing, force login
             setStep('login');
        }
    }
  }, []);

  const handleAliasCreated = (newAlias: string) => {
    setAlias(newAlias);
    setStep('pin_creation');
  };

  const handlePinCreated = (pin: string) => {
    if (alias && userInfo) {
        // This is the critical step: save all user info together under the new alias
        localStorage.setItem(`paytik_user_${alias}`, JSON.stringify({
            name: userInfo.name,
            email: userInfo.email,
            pincode: pin
        }));
        localStorage.setItem(`paytik_onboarded_${alias}`, 'true');
        localStorage.setItem('paytik_last_alias', alias);
        setStep('dashboard');
    } else {
        // This case should not happen, but it's a safeguard.
         toast({
            title: "Erreur critique d'inscription",
            description: "Les informations de l'utilisateur ou l'alias sont manquants. Veuillez réessayer.",
            variant: "destructive",
        });
        setStep('demo');
    }
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
    const userDataString = localStorage.getItem(`paytik_user_${loginAlias}`);
  
    if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData.pincode === pin) {
            setAlias(loginAlias);
            setUserInfo({ name: userData.name, email: userData.email });
            localStorage.setItem('paytik_last_alias', loginAlias);
            setStep('dashboard');
            toast({
              title: `Bienvenue, ${userData.name} !`,
              description: "Connexion réussie.",
            });
        } else {
             toast({
                title: "Code PIN incorrect",
                description: "Le code PIN que vous avez saisi est incorrect. Veuillez réessayer.",
                variant: "destructive",
            });
        }
    } else {
      toast({
        title: "Alias non trouvé",
        description: "Cet alias n'existe pas. Veuillez vérifier l'alias ou créer un nouveau compte.",
        variant: "destructive",
      });
    }
  }

  const logout = () => {
    // We don't clear localStorage for all users, just reset the state
    setAlias(null);
    setUserInfo(null); 
    setStep('demo');
  }

  const renderContent = () => {
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
        if (!alias || !userInfo) {
             // Should not happen, but as a safeguard
            return <LoginForm onLogin={handleLogin} onBack={() => setStep('demo')} />;
        }
        return (
            <AppProviders alias={alias}>
                <Dashboard alias={alias} userInfo={userInfo} onLogout={logout} />
            </AppProviders>
        );
      default:
        return <OnboardingDemo onStart={handleOnboardingStart} onLogin={handleLoginStart} />;
    }
  };
  
  if (!isClient) {
    return null;
  }

  return <main className="bg-background min-h-screen">{renderContent()}</main>;
}
