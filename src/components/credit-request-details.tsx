

"use client";

import type { BnplRequest, BnplStatus } from "@/lib/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, X, Hourglass, CheckCircle, Clock, Calendar, Info, ArrowLeft } from 'lucide-react';
import { Progress } from "./ui/progress";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { formatCurrency } from "@/lib/utils";

const formatDate = (dateString: string) => format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: fr });

const statusConfig: Record<BnplStatus, { text: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element }> = {
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
    // Basic parser for "X versements de Y Fcfa"
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

export default function CreditRequestDetails({ request, onBack }: { request: BnplRequest, onBack: () => void }) {
    const statusInfo = statusConfig[request.status];
    const repaidAmount = request.repaidAmount ?? 0;
    const progress = request.status === 'approved' ? (repaidAmount / request.amount) * 100 : 0;
    
    return (
        <>
            <DialogHeader>
                <DialogTitle>Détails de la demande de crédit</DialogTitle>
                <DialogDescription>
                    Demande du {formatDate(request.requestDate)} pour {request.merchantAlias}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4 text-sm">
                
                <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Montant du crédit</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(request.amount)}</p>
                </div>
                
                <DetailRow label="Statut" value={
                    <Badge variant={statusInfo.badgeVariant} className="gap-1 text-sm">
                        {statusInfo.icon} {statusInfo.text}
                    </Badge>
                } />

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Justification de la décision IA</AlertTitle>
                    <AlertDescription>
                        {request.reason}
                    </AlertDescription>
                </Alert>
                
                {request.status === 'approved' && (
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">Remboursement</h4>
                        <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{formatCurrency(repaidAmount)} remboursés</span>
                                <span>{formatCurrency(request.amount)}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right mt-1">{progress.toFixed(0)}%</p>
                        </div>
                        
                        {request.repaymentPlan && (
                           <div>
                                <h5 className="font-medium mb-2">Échéancier</h5>
                                <RepaymentSchedule plan={request.repaymentPlan}/>
                           </div>
                        )}
                    </div>
                )}

            </div>
            <DialogFooter className="justify-between">
                <Button variant="outline" onClick={onBack}>Besoin d'aide ?</Button>
                <DialogClose asChild>
                    <Button variant="ghost">Fermer</Button>
                </DialogClose>
            </DialogFooter>
        </>
    )
}
