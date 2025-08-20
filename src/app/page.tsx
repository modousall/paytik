
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
import Dashboard from '@/components/dashboard';
import AdminDashboard from '@/components/admin-dashboard';
import MerchantDashboard from '@/components/merchant-dashboard';
import { AvatarProvider } from '@/hooks/use-avatar';
import { BalanceProvider } from '@/hooks/use-balance';
import { ContactsProvider } from '@/hooks/use-contacts';
import { TontineProvider } from '@/hooks/use-tontine';
import { TransactionsProvider } from '@/hooks/use-transactions';
import { VaultsProvider } from '@/hooks/use-vaults';
import { VirtualCardProvider } from '@/hooks/use-virtual-card';
import { FeatureFlagProvider } from '@/hooks/use-feature-flags';
import { ProductProvider } from '@/hooks/use-product-management';

type UserInfo = {
  name: string;
  email: string;
  role: 'user' | 'merchant' | 'admin' | 'superadmin' | 'support';
};

type AppStep = 'demo' | 'permissions' | 'login' | 'kyc' | 'alias' | 'pin_creation' | 'dashboard' | 'admin' | 'merchant_dashboard';

// Function to ensure the superadmin exists in localStorage
const ensureSuperAdminExists = () => {
    const adminAlias = '+221775478575';
    const adminUserKey = `paytik_user_${adminAlias}`;

    if (typeof window !== 'undefined' && !localStorage.getItem(adminUserKey)) {
        const adminUser = {
            name: 'Modou Sall',
            email: 'modousall1@gmail.com',
            pincode: '1234',
            role: 'superadmin'
        };
        localStorage.setItem(adminUserKey, JSON.stringify(adminUser));
    }
};

export default function AuthenticationGate() {
  const [step, setStep] = useState<AppStep>('demo');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [alias, setAlias] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    // Ensure the superadmin account exists from the very beginning.
    ensureSuperAdminExists();

    const lastAlias = localStorage.getItem('paytik_last_alias');
    if (lastAlias) {
        const userDataString = localStorage.getItem(`paytik_user_${lastAlias}`);
        if(userDataString) {
            const userData = JSON.parse(userDataString);
            if(userData.isSuspended){
                toast({
                    title: "Compte Suspendu",
                    description: "Votre compte a été suspendu. Veuillez contacter le support.",
                    variant: "destructive",
                });
                localStorage.removeItem('paytik_last_alias');
                setStep('demo');
                return;
            }
            setUserInfo({ name: userData.name, email: userData.email, role: userData.role || 'user' });
            setAlias(lastAlias);
            // All roles now go to the dashboard first
            setStep('dashboard');
            
        } else {
             // Data mismatch, clear and go to demo
             localStorage.removeItem('paytik_last_alias');
             setStep('demo');
        }
    }
  }, [toast]);

  const handleAliasCreated = (newAlias: string) => {
    if (userInfo) {
      localStorage.setItem(`paytik_user_${newAlias}`, JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          pincode: '', // PIN will be set at next step
          role: 'user', // Default role for new users
      }));
      localStorage.setItem('paytik_active_alias_creation', newAlias);
      setAlias(newAlias);
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
            setAlias(aliasForPin);
            setUserInfo(prev => prev ? { ...prev, role: userData.role || 'user' } : null);
            setStep('dashboard');
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

  const handleAdminStart = () => {
    setStep('login');
  }
  
  const handleKycComplete = (info: Omit<UserInfo, 'role'>) => {
    // KYC form only collects name and email, role is defaulted to 'user'
    setUserInfo({ ...info, role: 'user' });
    setStep('alias');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('paytik_last_alias');
    setAlias(null);
    setUserInfo(null);
    setStep('demo');
    toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
    });
  }

  const handleLogin = (loginAlias: string, pin: string) => {
    const userDataString = localStorage.getItem(`paytik_user_${loginAlias}`);
  
    if (userDataString) {
        const userData = JSON.parse(userDataString);

        if (userData.isSuspended) {
            toast({
                title: "Compte Suspendu",
                description: "Votre compte a été suspendu par un administrateur. Veuillez contacter le support.",
                variant: "destructive",
            });
            return;
        }

        if (userData.pincode === pin) {
            localStorage.setItem('paytik_last_alias', loginAlias);
            setUserInfo({ name: userData.name, email: userData.email, role: userData.role || 'user' });
            setAlias(loginAlias);
            toast({
              title: `Bienvenue, ${userData.name} !`,
              description: "Connexion réussie.",
            });
            
            // ALL roles now go to the dashboard first.
            // The dashboard will then decide whether to show a button to a backoffice.
            setStep('dashboard');

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
    // This function can be simplified as most paths lead to the dashboard now
    // But we keep it for clarity of the onboarding flow.
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
        // The user info from KYC doesn't have a role, so we cast it.
        return <AliasCreation onAliasCreated={handleAliasCreated} userInfo={userInfo as {name: string, email: string}} />;
      case 'pin_creation':
        return <PinCreation onPinCreated={handlePinCreated} />;
      case 'admin':
         // This case is no longer directly reachable, flow goes through dashboard
        return <FeatureFlagProvider><ProductProvider><AdminDashboard onExit={handleLogout} /></ProductProvider></FeatureFlagProvider>;
       case 'merchant_dashboard':
        // This case is no longer directly reachable, flow goes through dashboard
         if(alias && userInfo) {
            return (
              <FeatureFlagProvider>
                <ProductProvider>
                  <MerchantDashboard userInfo={userInfo} onLogout={handleLogout} />
                </ProductProvider>
              </FeatureFlagProvider>
            );
        }
        setStep('demo'); // Fallback
        return null;
      case 'dashboard':
        if(alias && userInfo) {
            return (
              <FeatureFlagProvider>
                <ProductProvider>
                  <AvatarProvider alias={alias}>
                    <BalanceProvider alias={alias}>
                      <TransactionsProvider alias={alias}>
                        <ContactsProvider alias={alias}>
                          <VirtualCardProvider alias={alias}>
                            <VaultsProvider alias={alias}>
                              <TontineProvider alias={alias}>
                                  <Dashboard alias={alias} userInfo={userInfo} onLogout={handleLogout} />
                              </TontineProvider>
                            </VaultsProvider>
                          </VirtualCardProvider>
                        </ContactsProvider>
                      </TransactionsProvider>
                    </BalanceProvider>
                  </AvatarProvider>
                </ProductProvider>
              </FeatureFlagProvider>
            )
        }
        // Fallback if state is dashboard but data is missing
        setStep('demo');
        return <OnboardingDemo onStart={handleOnboardingStart} onLogin={handleLoginStart} />;
      default:
        return <OnboardingDemo onStart={handleOnboardingStart} onLogin={handleLoginStart} />;
    }
  };
  
  if (!isClient) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return <main className="bg-background min-h-screen">{renderContent()}</main>;
}
