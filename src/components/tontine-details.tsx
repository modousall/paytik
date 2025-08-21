

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useContacts } from "@/hooks/use-contacts";
import type { Tontine } from "@/hooks/use-tontine";
import { ArrowDown, ArrowUp, CheckCircle, Clock } from "lucide-react";
import type { Contact } from "@/hooks/use-contacts";
import { formatCurrency } from "@/lib/utils";

type TontineDetailsProps = {
    tontine: Tontine;
};

// This function now uses real contact data
const getParticipantsDetails = (tontine: Tontine, contacts: Contact[]) => {
    return tontine.participants.map(id => {
        const contact = contacts.find(c => c.id === id);
        // In a real app, status would come from the backend. We'll keep the random simulation for now for UI purposes.
        return {
            id,
            name: contact ? contact.name : `Membre Inconnu`,
            alias: contact ? contact.alias : 'N/A',
            status: Math.random() > 0.3 ? 'paid' : 'pending'
        }
    });
}

// History is still mocked for demonstration as it would require more complex logic
const mockHistory = (tontine: Tontine) => {
    const totalPot = tontine.amount * tontine.participants.length;
    return [
        { id: '1', type: 'contribution', amount: tontine.amount, date: '2024-07-01', user: 'Maman' },
        { id: '2', type: 'payout', amount: totalPot, date: '2024-07-01', user: 'Papa' },
        { id: '3', type: 'contribution', amount: tontine.amount, date: '2024-06-01', user: 'Moi' },
    ].filter(Boolean);
}


export default function TontineDetails({ tontine }: TontineDetailsProps) {
    const { contacts } = useContacts();
    const participants = getParticipantsDetails(tontine, contacts);
    const history = mockHistory(tontine);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Participants ({participants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {participants.map(p => (
                             <div key={p.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>
                                            {p.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-sm text-muted-foreground">{p.alias}</p>
                                    </div>
                                </div>
                                <Badge variant={p.status === 'paid' ? 'default' : 'secondary'} className={p.status === 'paid' ? 'bg-green-100 text-green-800' : ''}>
                                    {p.status === 'paid' ? <CheckCircle size={14} className="mr-1"/> : <Clock size={14} className="mr-1"/>}
                                    {p.status === 'paid' ? 'Payé' : 'En attente'}
                                </Badge>
                             </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historique des transactions</CardTitle>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {history.map(item => (
                             <TableRow key={item.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {item.type === 'contribution' ? 
                                            <ArrowDown className="h-4 w-4 text-green-600"/> : 
                                            <ArrowUp className="h-4 w-4 text-red-600"/>
                                        }
                                        <span>{item.type === 'contribution' ? 'Contribution' : 'Paiement'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{item.user}</TableCell>
                                <TableCell className={`text-right font-medium ${item.type === 'contribution' ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(item.amount)}
                                </TableCell>
                             </TableRow>
                           ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
    );
}
