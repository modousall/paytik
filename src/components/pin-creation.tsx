
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from 'lucide-react';

type PinCreationProps = {
    onPinCreated: (pin: string) => void;
};

export default function PinCreation({ onPinCreated }: PinCreationProps) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            toast({
                title: "Code PIN invalide",
                description: "Votre code PIN doit contenir exactement 4 chiffres.",
                variant: "destructive",
            });
            return;
        }
        if (pin !== confirmPin) {
            toast({
                title: "Les codes ne correspondent pas",
                description: "Veuillez vérifier que les deux codes PIN saisis sont identiques.",
                variant: "destructive",
            });
            return;
        }
        toast({
            title: "Code PIN créé !",
            description: "Votre compte est maintenant sécurisé.",
        });
        onPinCreated(pin);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                        <KeyRound className="h-8 w-8" />
                    </div>
                    <CardTitle>Sécurisez votre compte</CardTitle>
                    <CardDescription>Créez un code PIN à 4 chiffres pour protéger votre compte.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="pin">Nouveau Code PIN</Label>
                            <Input
                                id="pin"
                                type="password"
                                placeholder="••••"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                required
                                maxLength={4}
                                inputMode="numeric"
                                className="text-center text-2xl tracking-widest"
                            />
                        </div>
                         <div>
                            <Label htmlFor="confirm-pin">Confirmer le Code PIN</Label>
                            <Input
                                id="confirm-pin"
                                type="password"
                                placeholder="••••"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                required
                                maxLength={4}
                                inputMode="numeric"
                                className="text-center text-2xl tracking-widest"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6">
                           Créer le code PIN et terminer
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
