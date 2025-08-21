
"use client";

import { Button } from "./ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InviteFriendDialog = ({ alias }: { alias: string}) => {
    const { toast } = useToast();
    const referralCode = `MIDI-${alias.substring(0, 4).toUpperCase()}${new Date().getFullYear()}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        toast({ title: "Copié !", description: "Votre code de parrainage a été copié." });
    };
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Rejoignez Midi !',
                text: `Utilisez mon code de parrainage ${referralCode} pour obtenir un bonus lors de votre inscription sur Midi !`,
                url: window.location.href,
            }).catch((error) => console.log('Erreur de partage', error));
        } else {
             toast({ title: "Partage simulé", description: "Le message de parrainage a été copié dans votre presse-papiers." });
             navigator.clipboard.writeText(`Utilisez mon code de parrainage ${referralCode} pour obtenir un bonus lors de votre inscription sur Midi !`);
        }
    }
    
    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Invitez un ami et soyez récompensé</DialogTitle>
                <DialogDescription>
                    Partagez votre code unique. Votre ami recevra un bonus de bienvenue et vous recevrez une récompense après sa première transaction !
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 text-center">
                <p className="text-sm text-muted-foreground">Votre code de parrainage</p>
                <div className="bg-muted p-3 rounded-lg w-fit mx-auto">
                    <p className="text-2xl font-bold tracking-widest">{referralCode}</p>
                </div>
                 <div className="flex justify-center gap-2 pt-4">
                    <Button variant="outline" onClick={handleCopy}><Copy className="mr-2"/> Copier</Button>
                    <Button onClick={handleShare}><Share2 className="mr-2"/> Partager</Button>
                </div>
            </div>
        </DialogContent>
    )
}

export default InviteFriendDialog;
