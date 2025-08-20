
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

type UserInfo = {
  name: string;
  email: string;
};

type AppStep = 'demo' | 'permissions' | 'login' | 'kyc' | 'alias' | 'pin_creation';


export default function AuthenticationGate() {
  const [step, setStep] = useState<AppStep>('demo');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const lastAlias = localStorage.getItem('paytik_last_alias');
    if (lastAlias) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleAliasCreated = (newAlias: string) => {
    if (userInfo) {
      localStorage.setItem(`paytik_user_${newAlias}`, JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          pincode: '' // PIN will be set at next step
      }));
      localStorage.setItem('paytik_active_alias_creation', newAlias);
      setStep('pin_creation');
    } else {
        toast({
          title: "Erreur critique",
          description: "Les informations de l'utilisateur sont manquantes.",
          variant: "destructive",
        });
        setStep('kyc');
    }
  };

  const handlePinCreated = (pin: string) => {
    const aliasForPin = localStorage.getItem('paytik_active_alias_creation');
    if (aliasForPin) {
        const userDataString = localStorage.getItem(`paytik_user_${aliasForPin}`);
        if(userDataString){
            const userData = JSON.parse(userDataString);
            userData.pincode = pin;
            localStorage.setItem(`paytik_user_${aliasForPin}`, JSON.stringify(userData));
            localStorage.setItem(`paytik_onboarded_${aliasForPin}`, 'true');
            localStorage.setItem('paytik_last_alias', aliasForPin);
            localStorage.removeItem('paytik_active_alias_creation');
            router.push('/dashboard');
        }
    } else {
         toast({
            title: "Erreur critique d'inscription",
            description: "L'alias en cours de création est introuvable. Veuillez réessayer.",
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
            toast({
              title: `Bienvenue, ${userData.name} !`,
              description: "Connexion réussie.",
            });
            router.push('/dashboard');
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
      default:
        return <OnboardingDemo onStart={handleOnboardingStart} onLogin={handleLoginStart} />;
    }
  };
  
  if (!isClient) {
    return null; // ou un loader global
  }

  return <main className="bg-background min-h-screen">{renderContent()}</main>;
}
