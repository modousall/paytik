
"use client";

import { useState } from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, ArrowUp, ArrowDown, Download, RotateCcw, Filter, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
  } from "@/components/ui/dialog";
import type { Transaction } from '@/hooks/use-transactions';
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
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';

type TransactionHistoryProps = {
  showAll: boolean;
  onShowAll: () => void;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) + ' à ' + date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const TransactionIcon = ({ type, counterparty }: { type: string, counterparty: string }) => {
    const initial = counterparty.charAt(0).toUpperCase();
    switch (type) {
        case 'sent':
            return <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center"><ArrowUp className="text-red-600" /></div>;
        case 'received':
            return <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"><ArrowDown className="text-green-600" /></div>;
        case 'tontine':
            return (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${counterparty}`} alt="Tontine" data-ai-hint="piggy bank" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">{initial}</AvatarFallback>
                </Avatar>
            );
        default:
            return (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${counterparty}`} alt="Transaction" data-ai-hint="person face" />
                    <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
            );
    }
};

const TransactionDetailsDialog = ({ transaction }: { transaction: Transaction }) => {
    const { reverseTransaction } = useTransactions();
    const { toast } = useToast();

    const handleReverse = () => {
        reverseTransaction(transaction.id);
        toast({
            title: "Transaction retournée",
            description: `Le paiement de ${transaction.amount.toLocaleString()} Fcfa a été retourné.`,
        });
    }

    const canBeReversed = transaction.type !== 'tontine' && transaction.status !== 'Retourné';

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Détails de la transaction</DialogTitle>
                <DialogDescription>
                    ID: {transaction.id}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 border-y">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Montant</span>
                    <span className={`font-semibold text-lg ${transaction.type === 'received' || transaction.type === 'tontine' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'sent' ? '-' : '+'}
                        {transaction.amount.toLocaleString()} Fcfa
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{transaction.type === 'sent' ? 'À' : 'De'}</span>
                    <span className="font-medium">{transaction.counterparty}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Raison</span>
                    <span className="font-medium">{transaction.reason}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(transaction.date)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={transaction.status === 'Terminé' ? 'default' : transaction.status === 'Retourné' ? 'secondary' : 'destructive'} 
                           className={transaction.status === 'Terminé' ? 'bg-green-600/20 text-green-800' : ''}>
                        {transaction.status}
                    </Badge>
                </div>
            </div>
            <DialogFooter className="sm:justify-between gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={!canBeReversed}>
                            <RotateCcw className="mr-2" /> Retourner
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer le retour</AlertDialogTitle>
                            <AlertDialogDescription>
                                Voulez-vous vraiment retourner cette transaction ? Une nouvelle transaction sera créée pour annuler celle-ci. Cette action est irréversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReverse}>Confirmer</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button><Download className="mr-2" /> Télécharger le reçu</Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default function TransactionHistory({ showAll, onShowAll }: TransactionHistoryProps) {
    const { transactions } = useTransactions();
    const transactionsToShow = showAll ? transactions : transactions.slice(0, 3);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    {showAll && (
                        <Button onClick={onShowAll} variant="ghost" size="icon" className="mr-2">
                            <ArrowLeft />
                        </Button>
                    )}
                    <CardTitle className="text-lg font-semibold">
                        {showAll ? 'Historique des transactions' : 'Transactions Récentes'}
                    </CardTitle>
                </div>
                {showAll && (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="Rechercher..." className="pl-8 w-40" />
                        </div>
                        <Button variant="outline" size="icon"><Filter /></Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {transactionsToShow.map((tx) => (
                        <Dialog key={tx.id}>
                            <DialogTrigger asChild>
                                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                                    <TransactionIcon type={tx.type} counterparty={tx.counterparty}/>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{tx.counterparty}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {showAll ? formatDate(tx.date) : tx.reason}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-semibold ${tx.type === 'received' || tx.type === 'tontine' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'sent' ? '-' : '+'}{tx.amount.toLocaleString()} <span className="text-xs text-muted-foreground">Fcfa</span>
                                        </div>
                                        {showAll && <Badge variant={tx.status === 'Terminé' ? 'default' : tx.status === 'Retourné' ? 'secondary' : 'destructive'} className={tx.status === 'Terminé' ? 'bg-green-600/20 text-green-800' : ''}>{tx.status}</Badge>}
                                    </div>
                                </div>
                            </DialogTrigger>
                            <TransactionDetailsDialog transaction={tx} />
                        </Dialog>
                    ))}
                </div>
                {!showAll && transactions.length > 3 && (
                    <Button variant="link" className="w-full mt-4 text-accent" onClick={onShowAll}>
                        Tout afficher
                    </Button>
                )}
                 {transactions.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">Aucune transaction pour le moment.</p>
                )}
            </CardContent>
        </Card>
    );
}
