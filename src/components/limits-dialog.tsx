
"use client";

import { Card, CardContent } from "./ui/card";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const LimitsDialog = () => {
    const limits = [
        { name: "Plafond du solde total", value: "5 000 000 Fcfa" },
        { name: "Plafond par transaction", value: "2 000 000 Fcfa" },
        { name: "Plafond de transactions journalier", value: "5 000 000 Fcfa" },
        { name: "Plafond carte virtuelle", value: "2 000 000 Fcfa" },
    ]
    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Vos Plafonds de Compte</DialogTitle>
                <DialogDescription>
                   Ces limites sont définies pour votre sécurité. Contactez le support pour toute question.
                </DialogDescription>
            </DialogHeader>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type de Plafond</TableHead>
                                <TableHead className="text-right">Limite</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {limits.map(limit => (
                                <TableRow key={limit.name}>
                                    <TableCell>{limit.name}</TableCell>
                                    <TableCell className="text-right font-medium">{limit.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DialogContent>
    )
}

export default LimitsDialog;
