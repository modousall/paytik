
"use client"

import { useState } from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, User, TrendingUp, CreditCard, ShieldCheck, KeyRound, UserX, UserCheck, Eye, EyeOff, Copy, Ban, Trash2, Wallet, ArrowDown, ArrowUp } from "lucide-react";
import type { ManagedUserWithDetails, Transaction } from "@/hooks/use-user-management";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement } from "@/hooks/use-user-management";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import TransactionHistory from './transaction-history';
import { TransactionsContext } from '@/hooks/use-transactions';
import VirtualCard from './virtual-card';
import Vaults from './vaults';
import Tontine from './tontine';
import { VaultsProvider } from '@/hooks/use-vaults';
import { TontineProvider } from '@/hooks/use-tontine';
import { VirtualCardProvider } from '@/hooks/use-virtual-card';
import { BalanceProvider } from '@/hooks/use-balance';
import { TransactionsProvider } from '@/hooks/use-transactions';
import { AvatarProvider } from '@/hooks/use-avatar';

const ResetPinDialog = ({ user, onClose }: { user: ManagedUserWithDetails, onClose: () => void }) => {
    const [newPin, setNewPin] = useState("");
    const { resetUserPin } = useUserManagement();
    const { toast } = useToast();
    
    const handleReset = () => {
        if(newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            toast({
                title: "Code PIN invalide",
                description: "Le code PIN doit contenir exactement 4 chiffres.",
                variant: "destructive"
            });
            return;
        }
        resetUserPin(user.alias, newPin);
        toast({
            title: "Code PIN réinitialisé",
            description: `Le code PIN pour ${user.name} a été mis à jour.`
        });
        onClose();
    }
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Réinitialiser le PIN de {user.name}</DialogTitle>
                <DialogDescription>
                    Entrez un nouveau code PIN à 4 chiffres pour cet utilisateur. L'utilisateur devra être informé de ce changement.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="new-pin">Nouveau Code PIN</Label>
                <Input
                    id="new-pin"
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength={4}
                    placeholder="••••"
                    className="text-center tracking-widest text-lg"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Annuler</Button>
                </DialogClose>
                <Button onClick={handleReset}>Réinitialiser</Button>
            </DialogFooter>
        </DialogContent>
    )
}

// A custom provider to inject specific transactions into the history component
const StaticTransactionsProvider = ({ transactions, children }: { transactions: Transaction[], children: React.ReactNode }) => {
    const Context = TransactionsContext;
    const value = {
      transactions,
      addTransaction: () => {}, // No-op in this context
      reverseTransaction: () => {}, // No-op in this context
    };
    return <Context.Provider value={value}>{children}</Context.Provider>;
};

// This is a special wrapper to use the real hooks but initialized for a specific user.
const UserServiceProvider = ({ alias, children }: { alias: string, children: React.ReactNode }) => {
    return (
        <AvatarProvider alias={alias}>
            <BalanceProvider alias={alias}>
                <TransactionsProvider alias={alias}>
                    <VirtualCardProvider alias={alias}>
                        <VaultsProvider alias={alias}>
                            <TontineProvider alias={alias}>
                                {children}
                            </TontineProvider>
                        </VaultsProvider>
                    </VirtualCardProvider>
                </TransactionsProvider>
            </BalanceProvider>
        </AvatarProvider>
    )
};


export default function AdminUserDetail({ user, onBack }: { user: ManagedUserWithDetails, onBack: () => void }) {
    const { toggleUserSuspension } = useUserManagement();
    const { toast } = useToast();
    const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);

    const totalVaultsBalance = user.vaults.reduce((sum, v) => sum + v.balance, 0);

    const handleToggleSuspension = () => {
        toggleUserSuspension(user.alias, !user.isSuspended);
        toast({
            title: `Utilisateur ${!user.isSuspended ? 'suspendu' : 'réactivé'}`,
            description: `${user.name} a été ${!user.isSuspended ? 'suspendu' : 'réactivé'}.`
        });
        onBack(); // Go back to the list to see the updated status
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button onClick={onBack} variant="outline" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">Détail de l'utilisateur</h2>
                    <p className="text-muted-foreground">Vue d'ensemble du compte de {user.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: User Info & Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                             <Avatar className="h-16 w-16">
                                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-xl">{user.name}</CardTitle>
                                <CardDescription>{user.alias}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Email</span>
                                <span>{user.email}</span>
                           </div>
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Rôle</span>
                                <Badge variant={user.role === 'superadmin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                           </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Statut</span>
                                <Badge variant={user.isSuspended ? "destructive" : "default"} className={!user.isSuspended ? "bg-green-100 text-green-800" : ""}>
                                    {user.isSuspended ? "Suspendu" : "Actif"}
                                </Badge>
                           </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader><CardTitle>Actions de gestion</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                             <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" disabled={user.role === 'superadmin'}>
                                        <KeyRound className="mr-2"/> Réinitialiser PIN
                                    </Button>
                                </DialogTrigger>
                                {isPinDialogOpen && <ResetPinDialog user={user} onClose={() => setIsPinDialogOpen(false)}/>}
                            </Dialog>
                            <Button variant="destructive" onClick={handleToggleSuspension} disabled={user.role === 'superadmin'}>
                                {user.isSuspended ? <UserCheck className="mr-2"/> : <UserX className="mr-2"/>}
                                {user.isSuspended ? 'Réactiver' : 'Suspendre'}
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Résumé Financier</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-3">
                           <div className="flex justify-between items-center p-2 rounded-md bg-secondary">
                                <span className="font-medium">Solde Principal</span>
                                <span className="font-bold text-lg">{user.balance.toLocaleString()} Fcfa</span>
                           </div>
                           <div className="flex justify-between items-center p-2 rounded-md bg-secondary">
                                <span className="font-medium">Solde Carte Virtuelle</span>
                                <span className="font-bold text-lg">{(user.virtualCard?.balance ?? 0).toLocaleString()} Fcfa</span>
                           </div>
                           <div className="flex justify-between items-center p-2 rounded-md bg-secondary">
                                <span className="font-medium">Total en Coffres</span>
                                <span className="font-bold text-lg">{totalVaultsBalance.toLocaleString()} Fcfa</span>
                           </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Services & Transactions */}
                <div className="lg:col-span-2 space-y-6">
                     <UserServiceProvider alias={user.alias}>
                        <Card>
                            <CardHeader><CardTitle>Utilisation des Services</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-3 gap-4 text-center">
                               <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="p-4 rounded-lg bg-secondary hover:bg-muted cursor-pointer transition-colors">
                                            <CreditCard className={`mx-auto h-8 w-8 mb-2 ${user.virtualCard ? 'text-primary' : 'text-muted-foreground'}`}/>
                                            <p className="text-sm font-medium">Carte Virtuelle</p>
                                            <Badge variant={user.virtualCard ? 'default' : 'secondary'}>{user.virtualCard ? 'Gérer' : 'Inactive'}</Badge>
                                        </div>
                                    </DialogTrigger>
                                    {user.virtualCard && 
                                        <DialogContent className="max-w-2xl">
                                             <VirtualCard onBack={()=>{}}/>
                                        </DialogContent>
                                    }
                                </Dialog>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="p-4 rounded-lg bg-secondary hover:bg-muted cursor-pointer transition-colors">
                                            <TrendingUp className={`mx-auto h-8 w-8 mb-2 ${user.vaults.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}/>
                                            <p className="text-sm font-medium">Coffres-forts</p>
                                            <Badge variant={user.vaults.length > 0 ? 'default' : 'secondary'}>{user.vaults.length > 0 ? 'Gérer' : 'Inactifs'}</Badge>
                                        </div>
                                    </DialogTrigger>
                                     <DialogContent className="max-w-3xl">
                                        <Vaults onBack={()=>{}}/>
                                    </DialogContent>
                                </Dialog>
                               <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="p-4 rounded-lg bg-secondary hover:bg-muted cursor-pointer transition-colors">
                                            <ShieldCheck className={`mx-auto h-8 w-8 mb-2 ${user.tontines.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}/>
                                            <p className="text-sm font-medium">Tontines</p>
                                            <Badge variant={user.tontines.length > 0 ? 'default' : 'secondary'}>{user.tontines.length > 0 ? 'Gérer' : 'Inactives'}</Badge>
                                        </div>
                                    </DialogTrigger>
                                     <DialogContent className="max-w-4xl">
                                        <Tontine onBack={()=>{}}/>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    
                        {/* Wrap TransactionHistory in a special provider to show only this user's transactions */}
                        <StaticTransactionsProvider transactions={user.transactions}>
                            <TransactionHistory showAll={true} onShowAll={() => {}} />
                        </StaticTransactionsProvider>
                    </UserServiceProvider>
                </div>
            </div>
        </div>
    )
}
