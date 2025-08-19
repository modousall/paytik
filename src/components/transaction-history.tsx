"use client";

import { useTransactions } from '@/hooks/use-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type TransactionHistoryProps = {
  showAll: boolean;
  onShowAll: () => void;
};

export default function TransactionHistory({ showAll, onShowAll }: TransactionHistoryProps) {
  const { transactions } = useTransactions();
  
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
  }

  const TransactionIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'sent':
        return <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center"><ArrowUp className="text-red-600" /></div>;
      case 'received':
        return <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"><ArrowDown className="text-green-600" /></div>;
      case 'tontine':
         return (
            <Avatar className="h-10 w-10">
                <AvatarImage src="https://placehold.co/40x40.png" alt="Tontine" data-ai-hint="piggy bank" />
                <AvatarFallback>T</AvatarFallback>
            </Avatar>
        );
      default:
        return (
            <Avatar className="h-10 w-10">
                <AvatarImage src="https://placehold.co/40x40.png" alt="Transaction" />
                <AvatarFallback>T</AvatarFallback>
            </Avatar>
        );
    }
  };

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
            {!showAll && 
              <Button variant="ghost" size="icon">
                  <MoreHorizontal />
              </Button>
            }
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {transactionsToShow.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50">
                        <TransactionIcon type={tx.type} />
                        <div className="flex-grow">
                            <p className="font-semibold">{tx.counterparty}</p>
                            <p className="text-sm text-muted-foreground">{showAll ? formatDate(tx.date) : tx.reason}</p>
                        </div>
                        <div className="text-right">
                           <div className={`font-semibold ${tx.type === 'received' || tx.type === 'tontine' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'sent' ? '-' : '+'}{tx.amount.toLocaleString()} <span className="text-xs text-muted-foreground">Fcfa</span>
                            </div>
                           {showAll && <Badge variant={tx.status === 'Terminé' ? 'default' : 'destructive'} className={tx.status === 'Terminé' ? 'bg-green-600/20 text-green-800' : ''}>{tx.status}</Badge>}
                        </div>
                    </div>
                ))}
            </div>
            {!showAll && (
              <Button variant="link" className="w-full mt-4 text-accent" onClick={onShowAll}>
                  Tout afficher
              </Button>
            )}
        </CardContent>
    </Card>
  );
}
