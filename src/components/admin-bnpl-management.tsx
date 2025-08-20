
"use client";

import { useMemo, useState } from 'react';
import { useBnpl } from '@/hooks/use-bnpl';
import type { BnplRequest, BnplStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, X, Hourglass, Search } from 'lucide-react';
import { Input } from './ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString()} Fcfa`;
const formatDate = (dateString: string) => format(new Date(dateString), 'Pp', { locale: fr });

const statusConfig: Record<BnplStatus, { text: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element }> = {
    'review': { text: "En attente", badgeVariant: "outline", icon: <Hourglass className="h-4 w-4" /> },
    'approved': { text: "Approuvée", badgeVariant: "default", icon: <Check className="h-4 w-4" /> },
    'rejected': { text: "Rejetée", badgeVariant: "destructive", icon: <X className="h-4 w-4" /> },
};


export default function AdminBnplManagement() {
    const { requests, updateRequestStatus } = useBnpl();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRequests = useMemo(() => {
        return requests.filter(req => 
            req.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.merchantAlias.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [requests, searchTerm]);

    const handleUpdateRequest = (id: string, status: 'approved' | 'rejected') => {
        updateRequestStatus(id, status);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Gestion des Demandes de Crédit (BNPL)</CardTitle>
                        <CardDescription>
                            Examinez, approuvez ou rejetez les demandes de paiement échelonné des utilisateurs.
                        </CardDescription>
                    </div>
                     <div className="relative">
                        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Rechercher par alias..." 
                            className="pl-8 w-48"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Alias Utilisateur</TableHead>
                            <TableHead>Alias Marchand</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Raison IA</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRequests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>{formatDate(req.requestDate)}</TableCell>
                                <TableCell className="font-medium">{req.alias}</TableCell>
                                <TableCell>{req.merchantAlias}</TableCell>
                                <TableCell>{formatCurrency(req.amount)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{req.reason}</TableCell>
                                <TableCell>
                                    <Badge variant={statusConfig[req.status].badgeVariant} className="gap-1">
                                        {statusConfig[req.status].icon} {statusConfig[req.status].text}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {req.status === 'review' && (
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleUpdateRequest(req.id, 'approved')}>
                                                <Check className="mr-1" size={16}/> Approuver
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleUpdateRequest(req.id, 'rejected')}>
                                                <X className="mr-1" size={16}/> Rejeter
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredRequests.length === 0 && (
                    <div className="text-center p-8">
                        <p>Aucune demande de crédit à afficher.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
