
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    useSidebar,
    SidebarInset,
    SidebarTrigger, 
    SidebarRail,
    SidebarProvider
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Home, 
    ArrowUp, 
    PlusCircle, 
    PiggyBank, 
    Users, 
    CreditCard, 
    User,
    LogOut,
    Wallet
} from 'lucide-react';
import { useAvatar } from '@/hooks/use-avatar';
import {
    TransactionsProvider,
    ContactsProvider,
    VirtualCardProvider,
    TontineProvider,
    VaultsProvider,
    BalanceProvider,
    AvatarProvider
} from '@/hooks'; // Assuming barrel file in hooks
import { usePathname } from 'next/navigation';


type UserInfo = {
    name: string;
    email: string;
};

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


const SidebarContentComponent = ({ userInfo, onLogoutClick }: { userInfo: UserInfo | null, onLogoutClick: () => void }) => {
    const { avatar } = useAvatar();
    const pathname = usePathname();

    const menuItems = [
        { path: '/dashboard', icon: <Home />, label: 'Accueil' },
        { path: '/dashboard/payer', icon: <ArrowUp />, label: 'Payer & Transférer' },
        { path: '/dashboard/recharger', icon: <PlusCircle />, label: 'Recharger' },
        { path: '/dashboard/coffres', icon: <PiggyBank />, label: 'Coffres' },
        { path: '/dashboard/tontines', icon: <Users />, label: 'Tontines' },
        { path: '/dashboard/carte', icon: <CreditCard />, label: 'Ma Carte' },
        { path: '/dashboard/profil', icon: <User />, label: 'Profil' },
    ];
    
    return (
        <>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                        {avatar && <AvatarImage src={avatar} alt="User avatar" />}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            <Wallet />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-lg text-primary">PAYTIK</span>
                        <span className="text-xs text-muted-foreground">{userInfo?.name}</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="p-2">
                <SidebarMenu>
                    {menuItems.map(item => (
                        <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton href={item.path} isActive={pathname === item.path} tooltip={item.label}>
                                {item.icon}
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <Button variant="ghost" onClick={onLogoutClick}>
                    <LogOut className="mr-2" />
                    <span className="group-data-[collapsible=icon]:hidden">
                        Se déconnecter
                    </span>
                </Button>
            </SidebarFooter>
        </>
    );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [alias, setAlias] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const lastAlias = localStorage.getItem('paytik_last_alias');
    if (lastAlias) {
      const userDataString = localStorage.getItem(`paytik_user_${lastAlias}`);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setAlias(lastAlias);
        setUserInfo({ name: userData.name, email: userData.email });
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('paytik_last_alias');
    toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
    });
    router.push('/');
  }

  if (isLoading || !alias) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <SidebarProvider>
        <AppProviders alias={alias}>
            <Sidebar collapsible="icon" side="left" variant="sidebar">
                <SidebarContentComponent userInfo={userInfo} onLogoutClick={handleLogout} />
            </Sidebar>
            <SidebarInset>
                <div className="flex items-center justify-between border-b p-2">
                    <SidebarTrigger />
                    {/* Can add a global search or other header items here */}
                </div>
                {children}
            </SidebarInset>
            <SidebarRail />
        </AppProviders>
    </SidebarProvider>
  );
}
