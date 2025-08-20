
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { QrCode, Bell, Eye, EyeOff, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import QrCodeDisplay from './qr-code-display';
import Notifications from "./notifications";
import { Progress } from './ui/progress';
import { useBalance } from '@/hooks/use-balance';
import { useVirtualCard } from '@/hooks/use-virtual-card';
import { useVaults } from '@/hooks/use-vaults';
import { useTontine } from '@/hooks/use-tontine';
import { useAvatar } from '@/hooks/use-avatar';

type UserInfo = {
    name: string;
    email: string;
};
  
type HeaderProps = { 
    userInfo: UserInfo; 
    alias: string; 
    onProfileClick: () => void;
};

export default function DashboardHeader({ userInfo, alias, onProfileClick }: HeaderProps) {
    const { balance } = useBalance();
    const { card } = useVirtualCard();
    const { vaults } = useVaults();
    const { tontines } = useTontine();
    const { avatar } = useAvatar();

    const [isBalanceVisible, setIsBalanceVisible] = useState(true);

    const totalVaultsBalance = vaults.reduce((acc, vault) => acc + vault.balance, 0);
    const totalTontinesBalance = tontines.reduce((acc, tontine) => acc + (tontine.amount * tontine.participants.length), 0);
    
    const totalBalance = balance + (card?.balance || 0) + totalVaultsBalance + totalTontinesBalance;
    
    // Mock monthly budget for progress bar
    const spentAmount = 4500000;
    const monthlyBudget = 30000000;
    const progress = (spentAmount / monthlyBudget) * 100;

    return (
        <header className="mb-6">
            <div className="flex justify-between items-center mb-4">
                 <button onClick={onProfileClick} className="flex items-center gap-3 text-left rounded-md p-2 -ml-2 hover:bg-secondary transition-colors">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={avatar ?? `https://i.pravatar.cc/150?u=${userInfo.email}`} alt={userInfo.name} data-ai-hint="person face" />
                        <AvatarFallback>{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                     <div>
                        <p className="text-sm font-medium text-muted-foreground">Bienvenue,</p>
                        <p className="font-bold text-lg text-foreground">{userInfo.name}</p>
                    </div>
                </button>
                 <div className="flex items-center gap-1">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon"><QrCode /></Button>
                        </SheetTrigger>
                        <SheetContent className="p-0">
                            <QrCodeDisplay alias={alias} userInfo={userInfo} />
                        </SheetContent>
                    </Sheet>
                    <Notifications />
                 </div>
            </div>

            <div className="text-center cursor-pointer" onClick={() => setIsBalanceVisible(!isBalanceVisible)}>
                <p className="text-sm text-muted-foreground">Solde Total</p>
                <div className="flex items-center justify-center gap-2">
                     {isBalanceVisible ? (
                        <p className="text-4xl font-bold tracking-tight text-primary">
                            {totalBalance.toLocaleString()} <span className="text-lg font-normal">Fcfa</span>
                        </p>
                    ) : (
                        <p className="text-4xl font-bold tracking-tight text-primary">
                            ••••••••
                        </p>
                    )}
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
                       {isBalanceVisible ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </Button>
                </div>
            </div>

            <div className='mt-4 max-w-sm mx-auto'>
                <div className='text-xs flex justify-between text-muted-foreground mb-1'>
                    <span>Dépenses ce mois-ci</span>
                    <span>{spentAmount.toLocaleString()} / {monthlyBudget.toLocaleString()} Fcfa</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

        </header>
    );
}
