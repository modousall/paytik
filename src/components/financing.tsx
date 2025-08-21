
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useBnpl } from '@/hooks/use-bnpl';
import { useIslamicFinancing } from '@/hooks/use-islamic-financing';
import IslamicFinancingRequestForm from './islamic-financing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import CreditRequestDetails from './credit-request-details';
import FinancingRequestDetails from './financing-request-details';
import type { BnplRequest, FinancingRequest } from '@/lib/types';


type CombinedRequest = (BnplRequest | FinancingRequest) & { financingProduct: 'bnpl' | 'islamic' };

type FinancingProps = {
  onBack: () => void;
};

const formatDate = (dateString: string) => format(new Date(dateString), 'd MMM yyyy, HH:mm', { locale: fr });


const RequestHistory = () => {
    const { myRequests: bnplRequests } = useBnpl();
    const { myRequests: islamicRequests } = useIslamicFinancing();

    const combinedRequests: CombinedRequest[] = [
        ...bnplRequests.map(r => ({ ...r, financingProduct: 'bnpl' as const })),
        ...islamicRequests.map(r => ({ ...r, financingProduct: 'islamic' as const }))
    ].sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

    return (
         <Card>
            <CardHeader>
                <CardTitle>Historique des demandes</CardTitle>
                <CardDescription>Liste de toutes vos demandes de financement.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Statut</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {combinedRequests.map(req => (
                             <Dialog key={req.id}>
                                <DialogTrigger asChild>
                                    <TableRow className="cursor-pointer">
                                        <TableCell>{formatDate(req.requestDate)}</TableCell>
                                        <TableCell>
                                            {req.financingProduct === 'bnpl' ? 'Credit Marchand' : 'Financement Islamique'}
                                        </TableCell>
                                        <TableCell>{formatCurrency(req.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'outline'}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                </DialogTrigger>
                                <DialogContent>
                                    {req.financingProduct === 'bnpl' 
                                        ? <CreditRequestDetails request={req as BnplRequest} />
                                        : <FinancingRequestDetails request={req as FinancingRequest} />
                                    }
                                </DialogContent>
                            </Dialog>
                        ))}
                    </TableBody>
                </Table>
                 {combinedRequests.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                        <p>Aucune demande de financement pour le moment.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


export default function Financing({ onBack }: FinancingProps) {

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">Financement</h2>
          <p className="text-muted-foreground">Historique et nouvelles demandes de financement.</p>
        </div>
      </div>
      
      <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history">Mes Demandes</TabsTrigger>
                <TabsTrigger value="new">Nouvelle Demande</TabsTrigger>
            </TabsList>
            <TabsContent value="history">
                <RequestHistory />
            </TabsContent>
            <TabsContent value="new">
                <Card>
                    <CardHeader>
                        <CardTitle>Demande de Financement Islamique</CardTitle>
                        <CardDescription>Financez vos projets en accord avec vos valeurs.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <IslamicFinancingRequestForm onBack={() => {}} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
