"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const transactions = [
  {
    id: "TXN746382",
    type: "received",
    counterparty: "+221776543210",
    date: "2024-07-25",
    amount: 5000,
    status: "Terminé",
  },
  {
    id: "TXN927481",
    type: "sent",
    counterparty: "BoutiqueEnLigne Merch",
    date: "2024-07-24",
    amount: 12500,
    status: "Terminé",
  },
    {
    id: "TXN102938",
    type: "tontine",
    counterparty: "Tontine Familiale",
    date: "2024-07-23",
    amount: 20000,
    status: "Terminé",
  },
  {
    id: "TXN384756",
    type: "received",
    counterparty: "+221778765432",
    date: "2024-07-22",
    amount: 2500,
    status: "Terminé",
  },
];

export default function TransactionHistory() {
  const { toast } = useToast();

  const handleReturn = (id: string) => {
    toast({
        title: "Paiement retourné",
        description: `La transaction ${id} a été retournée.`,
    });
  };

  const handleDownload = (id: string) => {
    toast({
        title: "Reçu téléchargé",
        description: `Le reçu pour la transaction ${id} est en cours de génération.`,
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-primary">Historique des transactions</h2>
      <p className="text-muted-foreground mb-6">Consultez vos transactions récentes.</p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Détails</TableHead>
              <TableHead className="text-right">Montant (Fcfa)</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center rounded-full h-8 w-8 ${tx.type === 'received' || tx.type === 'tontine' ? 'bg-green-100' : 'bg-secondary'}`}>
                        {tx.type === 'received' || tx.type === 'tontine' ? 
                            <ArrowLeft className="h-4 w-4 text-green-700"/> :
                            <ArrowRight className="h-4 w-4 text-secondary-foreground"/>
                        }
                    </div>
                    <div>
                        <div className="font-medium">{tx.counterparty}</div>
                        <div className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={`text-right font-semibold ${tx.type === 'received' || tx.type === 'tontine' ? 'text-[hsl(var(--chart-2))]' : 'text-foreground'}`}>
                  {tx.type === 'received' || tx.type === 'tontine' ? '+' : '-'}{tx.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-2">
                        {(tx.type === 'received') && (
                            <Button variant="outline" size="sm" onClick={() => handleReturn(tx.id)}>
                                <RotateCcw className="mr-2 h-3 w-3" /> Retour
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(tx.id)}>
                            <Download className="mr-2 h-3 w-3" /> Reçu
                        </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
