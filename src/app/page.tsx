
'use client';

import { useState, useEffect } from 'react';
import OnboardingDemo from '@/components/onboarding-demo';
import AliasCreation from '@/components/alias-creation';
import Dashboard from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";


type UserInfo = {
  name: string;
  email: string;
};

type AppStep = 'demo' | 'login' | 'kyc' | 'alias' | 'dashboard';

const KYCForm = ({ onKycComplete }: { onKycComplete: (info: UserInfo) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir votre nom et votre email.",
        variant: "destructive",
      });
      return;
    }
    onKycComplete({ name, email });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nom complet</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="ex: Fatoumata Diop"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Adresse e-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="ex: fatoumata.diop@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                       Continuer
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
};

const LoginForm = ({ onLoginSuccess, onBack }: { onLoginSuccess: (alias: string) => void; onBack: () => void; }) => {
    const [alias, setAlias] = useState('');
    const { toast } = useToast();
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Simulate checking if alias exists in localStorage
      const storedAlias = localStorage.getItem('paytik_alias');
      const storedName = localStorage.getItem('paytik_username');
  
      if (storedAlias && storedName && alias === storedAlias) {
        toast({
          title: `Bienvenue, ${storedName} !`,
          description: "Connexion réussie.",
        });
        onLoginSuccess(alias);
      } else {
        toast({
          title: "Alias non trouvé",
          description: "Cet alias n'existe pas ou ne correspond à aucun utilisateur. Veuillez créer un compte.",
          variant: "destructive",
        });
      }
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <Card className="w-full max-w-md">
              <CardHeader>
                  <CardTitle>Se Connecter</CardTitle>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <Label htmlFor="alias-login">Votre Alias</Label>
                          <Input
                              id="alias-login"
                              type="text"
                              placeholder="Entrez votre alias"
                              value={alias}
                              onChange={(e) => setAlias(e.target.value)}
                              required
                          />
                      </div>
                      <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                         Se Connecter
                      </Button>
                      <Button variant="link" onClick={onBack} className="w-full">
                         Retour
                      </Button>
                  </form>
              </CardContent>
          </Card>
      </div>
    );
  };


export default function Home() {
  const [step, setStep] = useState<AppStep>('demo');
  const [alias, setAlias] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isClient, setIsClient] = useState(false);

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
    setStep('kyc');
  };

  const handleLoginStart = () => {
    setStep('login');
  };
  
  const handleKycComplete = (info: UserInfo) => {
    setUserInfo(info);
    setStep('alias');
  };

  const handleLoginSuccess = (loggedInAlias: string) => {
    const userName = localStorage.getItem('paytik_username');
    const userEmail = localStorage.getItem('paytik_useremail');
    if (userName && userEmail) {
      setAlias(loggedInAlias);
      setUserInfo({name: userName, email: userEmail});
      setStep('dashboard');
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
      case 'login':
        return <LoginForm onLoginSuccess={handleLoginSuccess} onBack={() => setStep('demo')} />;
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
    return null;
  }

  return <main className="bg-background min-h-screen">{renderStep()}</main>;
}
