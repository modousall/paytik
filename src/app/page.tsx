
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
import { TransactionsProvider, useTransactions } from '@/hooks/use-transactions';
import { VaultsProvider } from '@/hooks/use-vaults';
import { VirtualCardProvider } from '@/hooks/use-virtual-card';
import { FeatureFlagProvider } from '@/hooks/use-feature-flags';
import { ProductProvider } from '@/hooks/use-product-management';
import { RoleProvider } from '@/hooks/use-role-management';
import { MonthlyBudgetProvider } from '@/hooks/use-monthly-budget';
import { BnplProvider } from '@/hooks/use-bnpl';
import { IslamicFinancingProvider } from '@/hooks/use-islamic-financing';
import { TreasuryProvider } from '@/hooks/use-treasury-management';

type UserInfo = {
  name: string;
  email: string;
  role: 'user' | 'merchant' | 'admin' | 'superadmin' | 'support' | 'agent';
};

type AppStep = 'demo' | 'permissions' | 'login' | 'kyc' | 'alias' | 'pin_creation' | 'dashboard' | 'merchant_dashboard' | 'admin_dashboard';

// Function to ensure the superadmin exists in localStorage
const ensureSuperAdminExists = () => {
    const adminAlias = '+221775478575';
    const adminUserKey = `midi_user_${adminAlias}`;

    if (typeof window !== 'undefined' && !localStorage.getItem(adminUserKey)) {
        const adminUser = {
            name: 'Modou Sall',
            email: 'modousall1@gmail.com',
            pincode: '1234',
            role: 'superadmin',
        };
        localStorage.setItem(adminUserKey, JSON.stringify(adminUser));
        // Also set a default balance for the superadmin
        localStorage.setItem(`midi_balance_${adminAlias}`, '1000000');
    }
};

// A wrapper for all providers needed for a logged-in user experience
const UserSessionProviders = ({ alias, children }: { alias: string, children: React.ReactNode}) => {
    const { addTransaction } = useTransactions();
    return (
      <TreasuryProvider>
        <ProductProvider addSettlementTransaction={addTransaction}>
            <FeatureFlagProvider>
                <RoleProvider>
                    <MonthlyBudgetProvider>
                         <BalanceProvider alias={alias}>
                            <BnplProvider alias={alias}>
                                <IslamicFinancingProvider alias={alias}>
                                    <AvatarProvider alias={alias}>
                                        <ContactsProvider alias={alias}>
                                        <VirtualCardProvider alias={alias}>
                                            <VaultsProvider alias={alias}>
                                            <TontineProvider alias={alias}>
                                                {children}
                                            </TontineProvider>
                                            </VaultsProvider>
                                        </VirtualCardProvider>
                                        </ContactsProvider>
                                    </AvatarProvider>
                                </IslamicFinancingProvider>
                            </BnplProvider>
                        </BalanceProvider>
                    </MonthlyBudgetProvider>
                </RoleProvider>
            </FeatureFlagProvider>
      </ProductProvider>
    </TreasuryProvider>
    )
}

// Higher-level provider that includes Transactions
const AppProviders = ({ alias, children }: { alias: string, children: React.ReactNode}) => {
    return (
        <TransactionsProvider alias={alias}>
            <UserSessionProviders alias={alias}>
                {children}
            </UserSessionProviders>
        </TransactionsProvider>
    )
}

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

    const lastAlias = localStorage.getItem('midi_last_alias');
    if (lastAlias) {
        const userDataString = localStorage.getItem(`midi_user_${lastAlias}`);
        if(userDataString) {
            const userData = JSON.parse(userDataString);
            if(userData.isSuspended){
                toast({
                    title: "Compte Suspendu",
                    description: "Votre compte a été suspendu. Veuillez contacter le support.",
                    variant: "destructive",
                });
                localStorage.removeItem('midi_last_alias');
                setStep('demo');
                return;
            }
            const userRole = userData.role || 'user';
            setUserInfo({ name: userData.name, email: userData.email, role: userRole });
            setAlias(lastAlias);
            
            if (userRole === 'merchant') {
                setStep('merchant_dashboard');
            } else if (['admin', 'superadmin', 'support'].includes(userRole)) {
                // For privileged users, go to the main dashboard first, which contains the backoffice link.
                setStep('dashboard');
            } else {
                setStep('dashboard'); 
            }
            
        } else {
             // Data mismatch, clear and go to demo
             localStorage.removeItem('midi_last_alias');
             setStep('demo');
        }
    }
  }, [toast]);

  const handleAliasCreated = (newAlias: string) => {
    if (userInfo) {
      localStorage.setItem(`midi_user_${newAlias}`, JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          pincode: '', // PIN will be set at next step
          role: 'user', // Default role for new users
      }));
      // Ensure new users start with a zero balance
      localStorage.setItem(`midi_balance_${newAlias}`, '0');
      localStorage.setItem('midi_active_alias_creation', newAlias);
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
    const aliasForPin = localStorage.getItem('midi_active_alias_creation');
    if (aliasForPin) {
        const userDataString = localStorage.getItem(`midi_user_${aliasForPin}`);
        if(userDataString){
            const userData = JSON.parse(userDataString);
            userData.pincode = pin;
            localStorage.setItem(`midi_user_${aliasForPin}`, JSON.stringify(userData));
            localStorage.setItem(`midi_onboarded_${aliasForPin}`, 'true');
            localStorage.setItem('midi_last_alias', aliasForPin);
            localStorage.removeItem('midi_active_alias_creation');
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
    localStorage.removeItem('midi_last_alias');
    setAlias(null);
    setUserInfo(null);
    setStep('demo');
    toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
    });
  }

  const handleLogin = (loginAlias: string, pin: string) => {
    const userDataString = localStorage.getItem(`midi_user_${loginAlias}`);
  
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
            localStorage.setItem('midi_last_alias', loginAlias);
            const userRole = userData.role || 'user';
            setUserInfo({ name: userData.name, email: userData.email, role: userRole });
            setAlias(loginAlias);
            toast({
              title: `Bienvenue, ${userData.name} !`,
              description: "Connexion réussie.",
            });
            
            if (userRole === 'merchant') {
                setStep('merchant_dashboard');
            } else {
                // All other roles (user, admin, support, etc.) go to the main dashboard
                setStep('dashboard');
            }

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
    if (alias && userInfo) {
        // If a user is logged in, wrap the appropriate dashboard with all necessary providers
        return (
            <AppProviders alias={alias}>
                {step === 'dashboard' && <Dashboard alias={alias} userInfo={userInfo} onLogout={handleLogout} />}
                {step === 'merchant_dashboard' && <MerchantDashboard userInfo={userInfo} alias={alias} onLogout={handleLogout} />}
            </AppProviders>
        )
    }

    // If no user is logged in, show the public onboarding/login flow
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
        return <AliasCreation onAliasCreated={handleAliasCreated} userInfo={userInfo as {name: string, email: string}} />;
      case 'pin_creation':
        return <PinCreation onPinCreated={handlePinCreated} />;
      default:
         // Fallback for any state inconsistency
        setStep('demo');
        return <OnboardingDemo onStart={handleOnboardingStart} onLogin={handleLoginStart} />;
    }
  };
  
  if (!isClient) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return <main className="bg-background min-h-screen">{renderContent()}</main>;
}
