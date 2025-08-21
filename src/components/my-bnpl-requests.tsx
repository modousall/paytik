

"use client";

import { useMemo, useState } from 'react';
import { useBnpl } from '@/hooks/use-bnpl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, X, Hourglass, ArrowLeft, History } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { BnplRequest, BnplStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import CreditRequestDetails from './credit-request-details';
import { formatCurrency } from '@/lib/utils';

const formatDate = (dateString: string) => format(new Date(dateString), 'd MMM yyyy, HH:mm', { locale: fr });

const statusConfig: Record<BnplStatus, { text: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element }> = {
    'review': { text: "En attente", badgeVariant: "outline", icon: <Hourglass className="h-4 w-4" /> },
    'approved': { text: "Approuvée", badgeVariant: "default", icon: <Check className="h-4 w-4" /> },
    'rejected': { text: "Rejetée", badgeVariant: "destructive", icon: <X className="h-4 w-4" /> },
};

type MyBnplRequestsProps = {
    onBack: () => void;
};

export default function MyBnplRequests({ onBack }: MyBnplRequestsProps) {
    const { myRequests } = useBnpl();

    const sortedRequests = useMemo(() => {
        return [...myRequests].sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [myRequests]);

    return (
        <div>
             <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-primary">Mes Demandes de Credit Marchands</h2>
                    <p className="text-muted-foreground">Consultez l'historique et le statut de vos demandes.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Historique des Demandes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Marchand</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Raison de la décision</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedRequests.map(req => (
                                 <Dialog key={req.id}>
                                    <DialogTrigger asChild>
                                        <TableRow className="cursor-pointer">
                                            <TableCell>{formatDate(req.requestDate)}</TableCell>
                                            <TableCell className="font-medium">{req.merchantAlias}</TableCell>
                                            <TableCell>{formatCurrency(req.amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusConfig[req.status].badgeVariant} className="gap-1">
                                                    {statusConfig[req.status].icon} {statusConfig[req.status].text}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{req.reason}</TableCell>
                                        </TableRow>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <CreditRequestDetails request={req} />
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </TableBody>
                    </Table>
                    {sortedRequests.length === 0 && (
                        <div className="text-center p-10">
                            <History className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 font-semibold">Aucune demande de crédit</p>
                            <p className="text-sm text-muted-foreground">Vous n'avez pas encore fait de demande de paiement échelonné.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
