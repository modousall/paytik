
"use client";

import { useState, useMemo, useRef } from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, ArrowUp, ArrowDown, Download, RotateCcw, Filter, Search, Receipt, CreditCard, Landmark, PiggyBank, Wallet } from 'lucide-react';
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
    DialogClose
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import TransactionReceipt from './transaction-receipt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type TransactionHistoryProps = {
  showAll: boolean;
  onShowAll: (show: boolean) => void;
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

const TransactionIcon = ({ tx }: { tx: Transaction }) => {
    const initial = tx.counterparty.charAt(0).toUpperCase();
    
    if (tx.reason.includes('Approvisionnement Carte') || tx.reason.includes('Retrait depuis Carte')) {
        return (
            <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600"><CreditCard /></AvatarFallback>
            </Avatar>
        );
    }
    if (tx.reason.includes('Approvisionnement') && tx.counterparty.includes('Coffre')) {
         return (
            <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-100 text-amber-600"><PiggyBank /></AvatarFallback>
            </Avatar>
        );
    }
     if (tx.reason.includes('Retrait') && tx.counterparty.includes('Coffre')) {
         return (
            <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-emerald-100 text-emerald-600"><Wallet /></AvatarFallback>
            </Avatar>
        );
    }

    switch (tx.type) {
        case 'sent':
            return (
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-red-100 text-red-600"><ArrowUp /></AvatarFallback>
                </Avatar>
            );
        case 'versement':
             return (
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-orange-100 text-orange-600"><Landmark /></AvatarFallback>
                </Avatar>
            );
        case 'received':
            return (
                 <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 text-green-600"><ArrowDown /></AvatarFallback>
                </Avatar>
            );
        case 'card_recharge':
             return (
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600"><CreditCard /></AvatarFallback>
                </Avatar>
            );
        default:
             return (
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-muted-foreground">{initial}</AvatarFallback>
                </Avatar>
            );
    }
};

const TransactionDetailsDialog = ({ transaction }: { transaction: Transaction }) => {
    const { reverseTransaction } = useTransactions();
    const { toast } = useToast();
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleReverse = () => {
        reverseTransaction(transaction.id);
        toast({
            title: "Transaction retournée",
            description: `Le paiement de ${transaction.amount.toLocaleString()} Fcfa a été retourné.`,
        });
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        if (receiptRef.current) {
            try {
                const canvas = await html2canvas(receiptRef.current, { scale: 3 });
                const imgData = canvas.toDataURL('image/png');
                
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`recu-transaction-${transaction.id}.pdf`);
            } catch (error) {
                console.error("Error generating PDF:", error);
                toast({ title: "Erreur de téléchargement", description: "Impossible de générer le reçu PDF.", variant: "destructive" });
            } finally {
                setIsDownloading(false);
            }
        }
    };


    const canBeReversed = transaction.type !== 'tontine' && transaction.status !== 'Retourné' && transaction.type !== 'versement';

    return (
        <DialogContent className="max-w-sm">
             {/* Hidden receipt for rendering */}
            <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
                <div ref={receiptRef} style={{ width: '400px', padding: '20px', background: 'white' }}>
                    <TransactionReceipt transaction={transaction} />
                </div>
            </div>

            <DialogHeader>
                <DialogTitle>Détails de la transaction</DialogTitle>
                <DialogDescription>
                    ID : {transaction.id}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 border-y">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Montant</span>
                    <span className={`font-semibold text-base ${transaction.type === 'received' || transaction.type === 'tontine' || transaction.type === 'card_recharge' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'sent' || transaction.type === 'versement' ? '-' : '+'}
                        {transaction.amount.toLocaleString()} Fcfa
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{transaction.type === 'sent' ? 'À' : 'De'}</span>
                    <span className="font-medium">{transaction.counterparty}</span>
                </div>
                <div className="flex justify-between items-start gap-4 text-sm">
                    <span className="text-muted-foreground">Raison</span>
                    <span className="font-medium text-right">{transaction.reason}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(transaction.date)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={transaction.status === 'Terminé' ? 'default' : transaction.status === 'Retourné' ? 'secondary' : 'destructive'} 
                           className={transaction.status === 'Terminé' ? 'bg-green-100 text-green-800' : ''}>
                        {transaction.status}
                    </Badge>
                </div>
            </div>
            <DialogFooter className="sm:justify-between gap-2 flex-wrap">
                 <Button variant="ghost" onClick={handleDownload} disabled={isDownloading}>
                    <Download className={`mr-2 ${isDownloading ? 'animate-pulse' : ''}`} /> 
                    {isDownloading ? "Génération..." : "Reçu"}
                </Button>
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
                            <DialogClose asChild>
                                <AlertDialogAction onClick={handleReverse}>Confirmer</AlertDialogAction>
                            </DialogClose>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogFooter>
        </DialogContent>
    )
}

export default function TransactionHistory({ showAll, onShowAll }: TransactionHistoryProps) {
    const { transactions } = useTransactions();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                                tx.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                tx.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                tx.status.toLowerCase().includes(searchTerm.toLowerCase());
            
            const filterMatch = activeFilter === 'all' || tx.type === activeFilter;

            return searchMatch && filterMatch;
        });
    }, [transactions, searchTerm, activeFilter]);


    const transactionsToShow = showAll ? filteredTransactions : filteredTransactions.slice(0, 5);

    return (
        <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    {showAll && (
                        <Button onClick={() => onShowAll(false)} variant="ghost" size="icon" className="mr-2">
                            <ArrowLeft />
                        </Button>
                    )}
                    <CardTitle className="text-lg font-semibold">
                        {showAll ? 'Historique' : 'Transactions Récentes'}
                    </CardTitle>
                </div>
                {showAll && (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder="Rechercher..." 
                                className="pl-8 w-32 sm:w-40" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Filter />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Filtrer par type</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={activeFilter} onValueChange={setActiveFilter}>
                                    <DropdownMenuRadioItem value="all">Toutes</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="sent">Envoyées</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="received">Reçues</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="card_recharge">Recharges Carte</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="tontine">Tontine</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="versement">Versements</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-0">
                {transactionsToShow.length > 0 ? (
                    <div className="space-y-1">
                        {transactionsToShow.map((tx) => (
                            <Dialog key={tx.id}>
                                <DialogTrigger asChild>
                                    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                                        <TransactionIcon tx={tx}/>
                                        <div className="flex-grow">
                                            <p className="font-medium text-sm">{tx.counterparty}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {showAll ? formatDate(tx.date) : tx.reason}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-medium text-sm ${tx.type === 'received' || tx.type === 'tontine' || tx.type === 'card_recharge' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'sent' || tx.type === 'versement' ? '-' : '+'}
                                                {tx.amount.toLocaleString()} <span className="text-xs text-muted-foreground">Fcfa</span>
                                            </div>
                                            {showAll && <Badge variant={tx.status === 'Terminé' ? 'default' : tx.status === 'Retourné' ? 'secondary' : 'destructive'} className={`${tx.status === 'Terminé' ? 'bg-green-100 text-green-800' : ''} text-xs`}>{tx.status}</Badge>}
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <TransactionDetailsDialog transaction={tx} />
                            </Dialog>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                        <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h4 className="mt-4 text-lg font-semibold">Aucune transaction</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Vos transactions apparaîtront ici."}
                        </p>
                    </div>
                )}
                {!showAll && transactions.length > 5 && (
                    <Button variant="link" className="w-full mt-4 text-primary" onClick={() => onShowAll(true)}>
                        Tout afficher
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
