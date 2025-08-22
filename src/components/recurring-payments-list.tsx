

"use client";

import { useRecurringPayments } from "@/hooks/use-recurring-payments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trash2, Repeat, Calendar, Check, X } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
import { formatCurrency } from "@/lib/utils";

const frequencyLabels = {
    daily: 'Journalier',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
};

export default function RecurringPaymentsList() {
    const { recurringPayments, removeRecurringPayment } = useRecurringPayments();

    const upcomingPayments = recurringPayments.filter(p => !p.endDate || new Date(p.endDate) > new Date());
    const pastPayments = recurringPayments.filter(p => p.endDate && new Date(p.endDate) <= new Date());
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Jamais';
        return format(new Date(dateString), 'd MMM yyyy', { locale: fr });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Paiements Actifs</CardTitle>
                    <CardDescription>Liste de vos paiements programmés qui sont actuellement actifs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Destinataire</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Fréquence</TableHead>
                                <TableHead>Prochaine Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {upcomingPayments.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <div className="font-medium">{payment.recipientAlias}</div>
                                        <div className="text-sm text-muted-foreground">{payment.reason}</div>
                                    </TableCell>
                                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="gap-1">
                                            <Repeat size={12}/>{frequencyLabels[payment.frequency]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                           <Calendar size={12}/> {formatDate(payment.startDate)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive">
                                                    <Trash2 size={16}/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Arrêter ce paiement récurrent ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action est irréversible. Les futurs prélèvements pour "{payment.reason}" seront annulés.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => removeRecurringPayment(payment.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Oui, arrêter
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {upcomingPayments.length === 0 && (
                        <p className="text-center text-muted-foreground p-8">Aucun paiement récurrent actif.</p>
                    )}
                </CardContent>
            </Card>

            {pastPayments.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Paiements Terminés</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Destinataire</TableHead>
                                    <TableHead>Montant</TableHead>
                                    <TableHead>Fréquence</TableHead>
                                    <TableHead>Date de Fin</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {pastPayments.map(payment => (
                                    <TableRow key={payment.id} className="text-muted-foreground">
                                        <TableCell>{payment.recipientAlias}</TableCell>
                                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell>{frequencyLabels[payment.frequency]}</TableCell>
                                        <TableCell>{formatDate(payment.endDate)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
