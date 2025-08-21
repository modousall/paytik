

"use client";

import { useMemo } from 'react';
import type { ProductWithBalance } from './admin-product-management';
import type { Transaction } from '@/hooks/use-transactions';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, Package } from 'lucide-react';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

const formatDate = (dateString: string) => format(new Date(dateString), 'Pp', { locale: fr });

export default function AdminProductDetail({ product, allTransactions, onBack }: AdminProductDetailProps) {

    const { kpis, recentTransactions } = useMemo(() => {
        const productTransactions = allTransactions.filter(tx => 
            tx.counterparty.includes(product.name) || tx.reason.includes(product.name)
        );

        const totalVolume = productTransactions.reduce((acc, tx) => acc + tx.amount, 0);
        const totalTransactions = productTransactions.length;
        const totalCommissions = productTransactions.reduce((acc, tx) => acc + (product.commission || 0), 0);

        const recent = productTransactions
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 20);

        return {
            kpis: {
                totalVolume,
                totalTransactions,
                totalCommissions
            },
            recentTransactions: recent
        }

    }, [product, allTransactions]);


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button onClick={onBack} variant="outline" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Package /> {product.name}</h2>
                    <p className="text-muted-foreground">Vue d'ensemble et historique des transactions pour ce produit.</p>
                </div>
            </div>

             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                <CardHeader>
                    <CardTitle>Volume Total</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpis.totalVolume)}</div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle>Nb. de Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.totalTransactions.toLocaleString()}</div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle>Commissions Générées</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(kpis.totalCommissions)}</div>
                </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dernières Transactions pour {product.name}</CardTitle>
                    <CardDescription>Les 20 transactions les plus récentes impliquant ce produit.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Interlocuteur</TableHead>
                        <TableHead>Raison</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Statut</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {recentTransactions.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>{formatDate(tx.date)}</TableCell>
                            <TableCell>
                                <Badge variant={tx.type === 'received' ? 'default' : 'secondary'} className={tx.type === 'received' ? 'bg-green-100 text-green-800' : tx.type === 'sent' ? 'bg-red-100 text-red-800' : ''}>
                                    {tx.type}
                                </Badge>
                            </TableCell>
                            <TableCell>{tx.counterparty}</TableCell>
                            <TableCell>{tx.reason}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(tx.amount)}</TableCell>
                            <TableCell>
                                <Badge variant={tx.status === 'Terminé' ? 'default' : 'destructive'} className={tx.status === 'Terminé' ? 'bg-green-100 text-green-800' : ''}>
                                    {tx.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                {recentTransactions.length === 0 && (
                    <div className="text-center p-8">
                        <p>Aucune transaction à afficher pour ce produit.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
    )
}

