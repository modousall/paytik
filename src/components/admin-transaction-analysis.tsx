
"use client";

import { useMemo } from 'react';
import { useUserManagement, type ManagedUserWithTransactions, type Transaction } from '@/hooks/use-user-management';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from 'recharts';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useProductManagement } from '@/hooks/use-product-management';

export default function AdminTransactionAnalysis() {
  const { usersWithTransactions } = useUserManagement();
  const { billers, mobileMoneyOperators } = useProductManagement();
  const allProducts = useMemo(() => [...billers, ...mobileMoneyOperators], [billers, mobileMoneyOperators]);

  const { kpis, chartData, recentTransactions, productPerformance } = useMemo(() => {
    const allTransactions: Transaction[] = usersWithTransactions.flatMap(u => u.transactions);
    
    const totalVolume = allTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    const totalTransactions = allTransactions.length;
    const averageTransactionValue = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

    const dailyVolumes = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
        const date = subDays(new Date(), i);
        const formattedDate = format(date, 'd MMM', { locale: fr });
        dailyVolumes.set(formattedDate, 0);
    }

    allTransactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate > subDays(new Date(), 7)) {
            const formattedDate = format(txDate, 'd MMM', { locale: fr });
            if(dailyVolumes.has(formattedDate)) {
                dailyVolumes.set(formattedDate, dailyVolumes.get(formattedDate)! + tx.amount);
            }
        }
    });

    const chartData = Array.from(dailyVolumes.entries())
        .map(([date, total]) => ({ date, total }))
        .reverse();

    const recentTransactions = allTransactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
    
    // Calculate product performance
    const productStats = new Map<string, { volume: number; count: number; commissions: number }>();

    allProducts.forEach(p => {
        productStats.set(p.name, { volume: 0, count: 0, commissions: 0 });
    });
    
    allTransactions.forEach(tx => {
        const product = allProducts.find(p => p.name === tx.counterparty);
        if (product) {
            const stats = productStats.get(product.name)!;
            stats.volume += tx.amount;
            stats.count += 1;
            stats.commissions += product.commission;
            productStats.set(product.name, stats);
        }
    });

    const productPerformance = Array.from(productStats.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a,b) => b.volume - a.volume);
        
    return {
      kpis: {
        totalVolume,
        totalTransactions,
        averageTransactionValue,
      },
      chartData,
      recentTransactions,
      productPerformance,
    };
  }, [usersWithTransactions, allProducts]);

  const formatCurrency = (value: number) => `${Math.round(value).toLocaleString()} Fcfa`;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Volume Total Transigé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalVolume)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nombre de Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valeur Moyenne par Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.averageTransactionValue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volume des transactions (7 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [formatCurrency(value as number), "Volume"]}/>
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance des Produits</CardTitle>
          <CardDescription>Analyse des transactions par produit ou service.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Nb. Transactions</TableHead>
                <TableHead className="text-right">Volume Total</TableHead>
                <TableHead className="text-right">Commissions Générées</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productPerformance.map(p => (
                <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.volume)}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">{formatCurrency(p.commissions)}</TableCell>
                </TableRow>
              ))}
              {productPerformance.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center p-8">Aucune donnée de performance disponible.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Dernières Transactions Globales</CardTitle>
          <CardDescription>Les 10 transactions les plus récentes sur la plateforme.</CardDescription>
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
                    <TableCell>{format(new Date(tx.date), 'Pp', { locale: fr })}</TableCell>
                    <TableCell>
                        <Badge variant={tx.type === 'received' ? 'default' : 'secondary'} className={tx.type === 'received' ? 'bg-green-100 text-green-800' : tx.type === 'sent' ? 'bg-red-100 text-red-800' : ''}>
                            {tx.type}
                        </Badge>
                    </TableCell>
                    <TableCell>{tx.counterparty}</TableCell>
                    <TableCell>{tx.reason}</TableCell>
                    <TableCell className="text-right font-medium">{tx.amount.toLocaleString()} Fcfa</TableCell>
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
                <p>Aucune transaction à afficher pour le moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
