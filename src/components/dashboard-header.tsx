
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { QrCode, LogOut, Bell, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import QrCodeDisplay from './qr-code-display';
import Notifications from "./notifications";
import { Progress } from './ui/progress';
import { useBalance } from '@/hooks/use-balance';
import { useVirtualCard } from '@/hooks/use-virtual-card';
import { useVaults } from '@/hooks/use-vaults';
import { useTontine } from '@/hooks/use-tontine';

type UserInfo = {
    name: string;
    email: string;
};
  
type HeaderProps = { 
    userInfo: UserInfo; 
    alias: string; 
    onLogout: () => void;
};

export default function DashboardHeader({ userInfo, alias, onLogout }: HeaderProps) {
    const { balance } = useBalance();
    const { card } = useVirtualCard();
    const { vaults } = useVaults();
    const { tontines } = useTontine();

    const [isBalanceVisible, setIsBalanceVisible] = useState(true);

    const totalVaultsBalance = vaults.reduce((acc, vault) => acc + vault.balance, 0);
    const totalTontinesBalance = tontines.reduce((acc, tontine) => acc + (tontine.amount * tontine.participants.length), 0);
    
    const totalBalance = balance + (card?.balance || 0) + totalVaultsBalance + totalTontinesBalance;
    
    // Mock monthly budget for progress bar
    const monthlyBudget = 30000000;
    const spentAmount = 4500000;
    const progress = (spentAmount / monthlyBudget) * 100;

    return (
        <header className="mb-6">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${userInfo.email}`} alt={userInfo.name} data-ai-hint="person face" />
                        <AvatarFallback>{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="font-bold text-lg text-primary">PAYTIK</div>
                </div>
                 <div className="flex items-center gap-2">
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
                {isBalanceVisible ? (
                    <p className="text-4xl font-bold tracking-tight text-primary">
                        {totalBalance.toLocaleString()} <span className="text-lg font-normal">Fcfa</span>
                    </p>
                ) : (
                    <div className="text-4xl font-bold tracking-tight text-primary flex items-center justify-center gap-2">
                        <span>••••••••</span> <EyeOff size={32}/>
                    </div>
                )}
            </div>

            <div className='mt-4 max-w-sm mx-auto'>
                <div className='text-xs flex justify-between text-muted-foreground mb-1'>
                    <span>Ce mois-ci</span>
                    <span>{spentAmount.toLocaleString()} / {monthlyBudget.toLocaleString()} Fcfa</span>
                </div>
                <Progress value={progress} />
            </div>

        </header>
    );
}
