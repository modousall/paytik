
"use client";

import React from 'react';
import { Button } from "./ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';


const PromoCodeDialog = () => {
    const { toast } = useToast();
    const [code, setCode] = React.useState('');

    const applyCode = () => {
        if(!code) return;
        toast({
            title: "Code appliqué !",
            description: "Votre bonus de bienvenue a été crédité sur votre compte."
        });
    }
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Utiliser un code promotionnel</DialogTitle>
                <DialogDescription>
                    Saisissez votre code promo ci-dessous pour l'appliquer à votre compte.
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 py-4">
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ex: PAYTIK2024" />
                <DialogClose asChild>
                    <Button type="submit" onClick={applyCode} disabled={!code}>Appliquer</Button>
                </DialogClose>
            </div>
        </DialogContent>
    )
}

export default PromoCodeDialog;
