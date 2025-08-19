"use client";

import { useTransactions } from '@/hooks/use-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';

export default function TransactionHistory() {
  const { transactions } = useTransactions();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
    }) + ', ' + date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
  }

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Transactions</CardTitle>
            <Button variant="ghost" size="icon">
                <MoreHorizontal />
            </Button>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${tx.counterparty.charAt(0)}`} alt={tx.counterparty} data-ai-hint="person face" />
                            <AvatarFallback>{tx.counterparty.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{tx.counterparty}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                        </div>
                        <div className={`font-semibold ${tx.type === 'received' || tx.type === 'tontine' ? 'text-green-600' : ''}`}>
                            {tx.type === 'sent' ? '-' : ''}{tx.amount.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
            <Button variant="link" className="w-full mt-4 text-accent">
                Tout afficher
            </Button>
        </CardContent>
    </Card>
  );
}
