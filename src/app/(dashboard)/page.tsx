
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/dashboard';

type UserInfo = {
  name: string;
  email: string;
};

export default function DashboardPage() {
  const [alias, setAlias] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isClient, setIsClient] = useState(false);
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
        } else {
             router.push('/'); // User data is missing, force login
        }
    } else {
        router.push('/'); // No last alias, force login
    }
  }, [router]);


  const logout = () => {
    localStorage.removeItem('paytik_last_alias');
    router.push('/');
  }
  
  if (!isClient || !alias || !userInfo) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <Dashboard 
      alias={alias} 
      userInfo={userInfo} 
      onLogout={logout} 
    />
  );
}
