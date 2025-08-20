
"use client";

import type { BnplRequest, BnplStatus } from "@/lib/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, X, Hourglass, CheckCircle, Clock } from 'lucide-react';
import { Progress } from "./ui/progress";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString()} Fcfa`;
const formatDate = (dateString: string) => format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: fr });

const statusConfig: Record<BnplStatus, { text: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element }> = {
    'review': { text: "En attente", badgeVariant: "outline", icon: <Clock className="h-4 w-4" /> },
    'approved': { text: "Approuvée", badgeVariant: "default", icon: <Check className="h-4 w-4" /> },
    'rejected': { text: "Rejetée", badgeVariant: "destructive", icon: <X className="h-4 w-4" /> },
};


const DetailRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-right">{value}</span>
    </div>
);

export default function CreditRequestDetails({ request }: { request: BnplRequest }) {
    const statusInfo = statusConfig[request.status];
    const repaidAmount = request.repaidAmount ?? 0;
    const progress = request.status === 'approved' ? (repaidAmount / request.amount) * 100 : 0;
    
    return (
        <>
            <DialogHeader>
                <DialogTitle>Détails de la demande de crédit</DialogTitle>
                <DialogDescription>
                    Demande du {formatDate(request.requestDate)}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 border-y text-sm">
                <DetailRow label="Marchand" value={request.merchantAlias} />
                <DetailRow label="Montant demandé" value={<span className="text-lg font-bold text-primary">{formatCurrency(request.amount)}</span>} />
                <DetailRow label="Statut" value={
                    <Badge variant={statusInfo.badgeVariant} className="gap-1 text-sm">
                        {statusInfo.icon} {statusInfo.text}
                    </Badge>
                } />
                <DetailRow label="Raison de la décision" value={request.reason} />
                
                {request.status === 'approved' && (
                    <>
                         <hr className="my-2"/>
                         <DetailRow label="Plan de remboursement" value={request.repaymentPlan ?? 'N/A'} />
                         <DetailRow label="Montant remboursé" value={<span className="text-green-600 font-semibold">{formatCurrency(repaidAmount)}</span>} />
                        <div>
                            <Progress value={progress} className="h-2 my-1" />
                            <p className="text-xs text-muted-foreground text-right">{progress.toFixed(0)}% remboursé</p>
                        </div>
                    </>
                )}

            </div>
            <DialogFooter>
                <Button variant="outline">Besoin d'aide ?</Button>
            </DialogFooter>
        </>
    )
}
