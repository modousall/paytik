
"use client";

import type { FinancingRequest, FinancingStatus } from "@/lib/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, X, Hourglass, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { formatCurrency } from "@/lib/utils";

const formatDate = (dateString: string) => format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: fr });

const statusConfig: Record<FinancingStatus, { text: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element }> = {
    'review': { text: "En attente", badgeVariant: "outline", icon: <Hourglass className="h-4 w-4" /> },
    'approved': { text: "Approuvée", badgeVariant: "default", icon: <Check className="h-4 w-4" /> },
    'rejected': { text: "Rejetée", badgeVariant: "destructive", icon: <X className="h-4 w-4" /> },
};

const DetailRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-right">{value}</span>
    </div>
);

const RepaymentSchedule = ({ plan }: { plan: string }) => {
    // Basic parser for "X versements de Y F"
    const match = plan.match(/(\d+)\s*versements\s*de\s*([\d\s.,]+)\s*F/);
    if (!match) return <p className="text-sm text-muted-foreground">{plan}</p>;

    const count = parseInt(match[1], 10);
    const amount = parseFloat(match[2].replace(/[\s,]/g, ''));

    return (
        <div className="space-y-3">
             {[...Array(Math.min(count, 3))].map((_, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-secondary rounded-full">
                        <Calendar className="h-4 w-4 text-secondary-foreground"/>
                    </div>
                    <div className="flex-grow">
                        <p className="font-medium">Versement {i + 1}</p>
                        <p className="text-muted-foreground">{formatCurrency(amount)} - A venir</p>
                    </div>
                    <Badge variant="outline">En attente</Badge>
                </div>
            ))}
            {count > 3 && <p className="text-xs text-center text-muted-foreground">et {count - 3} autres...</p>}
        </div>
    )
}

export default function FinancingRequestDetails({ request }: { request: FinancingRequest }) {
    const statusInfo = statusConfig[request.status];
    
    return (
        <>
            <DialogHeader>
                <DialogTitle>Détails de la demande de Financement</DialogTitle>
                <DialogDescription>
                    Demande du {formatDate(request.requestDate)} par {request.alias}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4 text-sm">
                
                <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Montant demandé</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(request.amount)}</p>
                </div>

                <DetailRow label="Statut" value={<Badge variant={statusInfo.badgeVariant} className="gap-1 text-sm">{statusInfo.icon} {statusInfo.text}</Badge>} />
                <DetailRow label="Type" value={request.financingType} />
                <DetailRow label="Durée" value={`${request.durationMonths} mois`} />
                <DetailRow label="Objet" value={request.purpose} />
                
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Justification de la décision IA</AlertTitle>
                    <AlertDescription>{request.reason}</AlertDescription>
                </Alert>
                
                {request.status === 'approved' && request.repaymentPlan && (
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">Plan de Remboursement</h4>
                        <RepaymentSchedule plan={request.repaymentPlan}/>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline">Besoin d'aide ?</Button>
            </DialogFooter>
        </>
    )
}
