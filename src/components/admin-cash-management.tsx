
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Download, TrendingUp, Landmark, Banknote, Globe, PlusCircle, Calculator } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import AdminTegSimulator from './admin-teg-simulator';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const initialTreasuryData = {
    ownFunds: 150000000,
    clientFunds: 850000000,
    assets: {
        centralBank: 300000000,
        commercialBanks: 450000000,
        mobileMoneyOperators: 200000000,
        foreignCorrespondents: 50000000,
    },
    operations: [
        { id: 'op1', date: '2024-07-22', type: 'Virement', from: 'Fonds Propres', to: 'Bank ABC', amount: 25000000, status: 'Terminé' },
        { id: 'op2', date: '2024-07-21', type: 'Dépôt', from: 'Wave', to: 'Trésorerie Clients', amount: 15000000, status: 'Terminé' },
        { id: 'op3', date: '2024-07-20', type: 'Règlement', from: 'Trésorerie Clients', to: 'SENELEC', amount: 5000000, status: 'Terminé' },
    ]
};

export default function AdminCashManagement() {
    const [treasuryData, setTreasuryData] = useState(initialTreasuryData);

    const totalTreasury = useMemo(() => treasuryData.ownFunds + treasuryData.clientFunds, [treasuryData]);

    const assetDistributionData = useMemo(() => [
        { name: 'Banque Centrale', value: treasuryData.assets.centralBank },
        { name: 'Banques Commerciales', value: treasuryData.assets.commercialBanks },
        { name: 'Opérateurs Mobile Money', value: treasuryData.assets.mobileMoneyOperators },
        { name: 'Correspondants Étrangers', value: treasuryData.assets.foreignCorrespondents },
    ], [treasuryData.assets]);
    
    const fundsDistributionData = useMemo(() => [
        { name: 'Fonds des Clients', value: treasuryData.clientFunds },
        { name: 'Fonds Propres', value: treasuryData.ownFunds },
    ], [treasuryData]);


    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
          const data = payload[0];
          return (
            <div className="p-2 text-sm bg-background border rounded-lg shadow-lg">
              <p className="font-bold">{`${data.name}`}</p>
              <p style={{ color: data.payload.fill }}>{`${formatCurrency(data.value)}`}</p>
            </div>
          );
        }
        return null;
      };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gestion de Trésorerie</CardTitle>
                    <CardDescription>Vue d'ensemble des actifs et des opérations de trésorerie de Midi.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Trésorerie Totale</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{formatCurrency(totalTreasury)}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Fonds des Clients</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(treasuryData.clientFunds)}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Fonds Propres</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{formatCurrency(treasuryData.ownFunds)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ratio Fonds Propres</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{((treasuryData.ownFunds / totalTreasury) * 100).toFixed(2)}%</div></CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Répartition de la Trésorerie</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={fundsDistributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={p => `${(p.percent * 100).toFixed(0)}%`}>
                                    {fundsDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Répartition des Actifs</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={assetDistributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={p => `${(p.percent * 100).toFixed(0)}%`}>
                                    {assetDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>
            </div>
            
            <Card>
                <CardHeader>
                     <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Opérations de Trésorerie Récentes</CardTitle>
                            <CardDescription>Suivi des mouvements de fonds internes et avec les partenaires.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline"><Calculator className="mr-2"/>Simulateur TEG</Button>
                                </DialogTrigger>
                                <AdminTegSimulator/>
                            </Dialog>
                            <Button><PlusCircle className="mr-2"/> Nouvelle Opération</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>De</TableHead>
                                <TableHead>À</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {treasuryData.operations.map(op => (
                                <TableRow key={op.id}>
                                    <TableCell>{op.date}</TableCell>
                                    <TableCell><Badge variant="secondary">{op.type}</Badge></TableCell>
                                    <TableCell>{op.from}</TableCell>
                                    <TableCell>{op.to}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(op.amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant={op.status === 'Terminé' ? 'default' : 'outline'} className={op.status === 'Terminé' ? 'bg-green-100 text-green-800' : ''}>
                                            {op.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="justify-end">
                    <Button variant="outline"><Download className="mr-2"/> Exporter le Grand Livre</Button>
                </CardFooter>
            </Card>

        </div>
    );
}
