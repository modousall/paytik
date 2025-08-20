
'use client';

import { useState, useEffect } from 'react';
import OnboardingDemo from '@/components/onboarding-demo';
import AliasCreation from '@/components/alias-creation';
import PermissionsRequest from '@/components/permissions-request';
import LoginForm from '@/components/login-form';
import KYCForm from '@/components/kyc-form';
import PinCreation from '@/components/pin-creation';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/dashboard'; // Import Dashboard
import { 
    TransactionsProvider,
    ContactsProvider,
    VirtualCardProvider,
    TontineProvider,
    VaultsProvider,
    BalanceProvider,
    AvatarProvider
} from '@/hooks';

type UserInfo = {
  name: string;
  email: string;
};

type AppStep = 'demo' | 'permissions' | 'login' | 'kyc' | 'alias' | 'pin_creation' | 'dashboard';


export default function AuthenticationGate() {
  const [step, setStep] = useState<AppStep>('demo');
  const [alias, setAlias] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
            // User data is missing for the last alias, force login
            localStorage.removeItem('paytik_last_alias');
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
        localStorage.setItem(`paytik_user_${alias}`, JSON.stringify({
            name: userInfo.name,
            email: userInfo.email,
            pincode: pin
        }));
        localStorage.setItem(`paytik_onboarded_${alias}`, 'true');
        localStorage.setItem('paytik_last_alias', alias);
        setStep('dashboard');
    } else {
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
            localStorage.setItem('paytik_last_alias', loginAlias);
            setAlias(loginAlias);
            setUserInfo({ name: userData.name, email: userData.email });
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

  const handleLogout = () => {
    localStorage.removeItem('paytik_last_alias');
    setAlias(null);
    setUserInfo(null);
    setStep('demo');
  }

  const renderContent = () => {
    switch (step) {
      case 'dashboard':
          if (!alias) return null;
          return (
            <AvatarProvider alias={alias}>
              <BalanceProvider alias={alias}>
                <TransactionsProvider alias={alias}>
                  <ContactsProvider alias={alias}>
                    <VirtualCardProvider alias={alias}>
                      <TontineProvider alias={alias}>
                        <VaultsProvider alias={alias}>
                          {userInfo && <Dashboard alias={alias} userInfo={userInfo} onLogout={handleLogout}/>}
                        </VaultsProvider>
                      </TontineProvider>
                    </VirtualCardProvider>
                  </ContactsProvider>
                </TransactionsProvider>
              </BalanceProvider>
            </AvatarProvider>
          );
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
      default:
        return <OnboardingDemo onStart={handleOnboardingStart} onLogin={handleLoginStart} />;
    }
  };
  
  if (!isClient) {
    return null; // ou un loader global
  }

  return <main className="bg-background min-h-screen">{renderContent()}</main>;
}
