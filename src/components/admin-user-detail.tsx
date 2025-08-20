
"use client"

import { useState, useMemo } from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, User, TrendingUp, CreditCard, ShieldCheck, KeyRound, UserX, UserCheck, Ban, Wallet, Settings, Users as TontineIcon, Clock, Briefcase } from "lucide-react";
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
import { VaultsProvider } from '@/hooks/use-vaults';
import { TontineProvider } from '@/hooks/use-tontine';
import { VirtualCardProvider } from '@/hooks/use-virtual-card';
import { BalanceProvider } from '@/hooks/use-balance';
import { TransactionsProvider } from '@/hooks/use-transactions';
import { AvatarProvider } from '@/hooks/use-avatar';
import { ContactsProvider } from '@/hooks/use-contacts';
import { Switch } from './ui/switch';
import { FeatureFlagProvider, defaultFlags } from '@/hooks/use-feature-flags';

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

// This is a special wrapper to use the real hooks but initialized for a specific user.
const UserServiceProvider = ({ alias, children }: { alias: string, children: React.ReactNode }) => {
    return (
        <FeatureFlagProvider alias={alias}>
            <AvatarProvider alias={alias}>
                <BalanceProvider alias={alias}>
                    <TransactionsProvider alias={alias}>
                        <ContactsProvider alias={alias}>
                            <VirtualCardProvider alias={alias}>
                                <VaultsProvider alias={alias}>
                                    <TontineProvider alias={alias}>
                                        {children}
                                    </TontineProvider>
                                </VaultsProvider>
                            </VirtualCardProvider>
                        </ContactsProvider>
                    </TransactionsProvider>
                </BalanceProvider>
            </AvatarProvider>
        </FeatureFlagProvider>
    )
};

export default function AdminUserDetail({ user, onBack }: { user: ManagedUserWithDetails, onBack: () => void }) {
    const { toggleUserSuspension } = useUserManagement();
    const { toast } = useToast();
    const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
    
    const todaysRevenue = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return user.transactions
            .filter(tx => tx.type === 'received' && tx.date.startsWith(today))
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [user.transactions]);

    const todaysTransactionsCount = useMemo(() => {
         const today = new Date().toISOString().split('T')[0];
        return user.transactions.filter(tx => tx.type === 'received' && tx.date.startsWith(today)).length;
    }, [user.transactions]);

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
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Solde Principal</span>
                                <span className="font-semibold">{user.balance.toLocaleString()} Fcfa</span>
                           </div>
                        </CardContent>
                    </Card>

                    {user.role === 'merchant' && (
                        <Card>
                             <CardHeader><CardTitle>Statistiques Marchand (Jour)</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                 <div className="flex items-center gap-4">
                                     <div className="p-3 bg-green-100 rounded-lg"><TrendingUp className="h-6 w-6 text-green-700"/></div>
                                     <div>
                                         <p className="text-muted-foreground text-sm">Chiffre d'affaires</p>
                                         <p className="font-bold text-lg">{todaysRevenue.toLocaleString()} Fcfa</p>
                                     </div>
                                 </div>
                                  <div className="flex items-center gap-4">
                                     <div className="p-3 bg-blue-100 rounded-lg"><Briefcase className="h-6 w-6 text-blue-700"/></div>
                                     <div>
                                         <p className="text-muted-foreground text-sm">Transactions</p>
                                         <p className="font-bold text-lg">{todaysTransactionsCount}</p>
                                     </div>
                                 </div>
                             </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader><CardTitle>Actions de gestion</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                             <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" disabled={user.role === 'superadmin'}>
                                        <KeyRound className="mr-2"/> Réinitialiser PIN
                                    </Button>
                                </DialogTrigger>
                                {isPinDialogOpen && <ResetPinDialog user={user} onClose={() => setIsPinDialogOpen(false)} />}
                            </Dialog>
                            <Button variant="destructive" onClick={handleToggleSuspension} disabled={user.role === 'superadmin'}>
                                {user.isSuspended ? <UserCheck className="mr-2"/> : <UserX className="mr-2"/>}
                                {user.isSuspended ? 'Réactiver' : 'Suspendre'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <UserServiceProvider alias={user.alias}>
                        <Card>
                             <CardHeader><CardTitle>Historique des transactions de l'utilisateur</CardTitle></CardHeader>
                             <CardContent>
                                <TransactionHistory showAll={true} onShowAll={() => {}} />
                             </CardContent>
                        </Card>
                    </UserServiceProvider>
                </div>
            </div>
        </div>
    )
}
