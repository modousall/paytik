"use client";

import { useState, useEffect } from 'react';
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
import { Badge } from "@/components/ui/badge";
import type { Transaction } from '@/hooks/use-transactions';
import { useTransactions } from '@/hooks/use-transactions';

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Terminé":
        return "default";
      case "En attente":
        return "secondary";
      case "Échoué":
        return "destructive";
      default:
        return "outline";
    }
  };

export default function TransactionHistory() {
  const { toast } = useToast();
  const { transactions } = useTransactions();

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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) + ' à ' + date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
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
              <TableHead className="text-right hidden sm:table-cell">Montant (Fcfa)</TableHead>
              <TableHead className="text-center hidden md:table-cell">Statut</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center rounded-full h-10 w-10 flex-shrink-0 ${tx.type === 'received' || tx.type === 'tontine' ? 'bg-green-100' : 'bg-secondary'}`}>
                          {tx.type === 'received' || tx.type === 'tontine' ? 
                              <ArrowLeft className="h-5 w-5 text-green-700"/> :
                              <ArrowRight className="h-5 w-5 text-secondary-foreground"/>
                          }
                      </div>
                      <div className="flex-grow">
                          <div className="font-medium">{tx.counterparty}</div>
                          <div className="text-sm text-muted-foreground truncate">{tx.reason}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(tx.date)}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                              <span className={`font-semibold ${tx.type === 'received' || tx.type === 'tontine' ? 'text-[hsl(var(--chart-2))]' : 'text-foreground'}`}>
                                  {tx.type === 'received' || tx.type === 'tontine' ? '+' : '-'}{tx.amount.toLocaleString()} Fcfa
                              </span>
                               - {tx.status}
                          </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-semibold hidden sm:table-cell ${tx.type === 'received' || tx.type === 'tontine' ? 'text-[hsl(var(--chart-2))]' : 'text-foreground'}`}>
                    {tx.type === 'received' || tx.type === 'tontine' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                      <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                          {(tx.type === 'received') && (
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleReturn(tx.id)}>
                                  <RotateCcw className="h-4 w-4" />
                                  <span className="sr-only">Retour</span>
                              </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(tx.id)}>
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Reçu</span>
                          </Button>
                      </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Aucune transaction pour le moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
