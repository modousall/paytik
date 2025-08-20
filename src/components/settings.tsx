
"use client";

import React from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, ChevronRight, Share2, Sparkles, Phone, FileCheck, MapPin, Smartphone, ShieldCheck, LogOut, Ticket, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import ChangePinForm from './change-pin-form';
import ConnectedDevices from './connected-devices';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';


type SettingsProps = {
    alias: string;
    onBack: () => void;
    onLogout: () => void;
};

type SettingItemProps = {
    icon: React.ReactNode;
    text: string;
    onClick?: () => void;
    isDestructive?: boolean;
    asChild?: boolean;
    children?: React.ReactNode;
}

const SettingItem = ({ icon, text, onClick, isDestructive = false, asChild = false, children }: SettingItemProps) => {
    const { toast } = useToast();
    const Component = asChild ? "div" : "button";

    const handleClick = onClick || (() => {
        toast({
            title: "Fonctionnalité à venir",
            description: `L'option "${text}" sera bientôt disponible.`,
        })
    });
    
    return (
        <Component
            onClick={asChild ? undefined : handleClick}
            className={`w-full flex items-center p-4 text-left ${isDestructive ? 'text-destructive' : 'text-foreground'} ${asChild ? '' : 'cursor-pointer'}`}
        >
            {icon}
            <span className="flex-grow">{text}</span>
            {children ? children : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </Component>
    )
}

const InviteFriendDialog = ({ alias }: { alias: string}) => {
    const { toast } = useToast();
    const referralCode = `PAYTIK-${alias.substring(0, 4).toUpperCase()}${new Date().getFullYear()}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        toast({ title: "Copié !", description: "Votre code de parrainage a été copié." });
    };
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Rejoignez PAYTIK !',
                text: `Utilisez mon code de parrainage ${referralCode} pour obtenir un bonus lors de votre inscription sur PAYTIK !`,
                url: window.location.href,
            }).catch((error) => console.log('Erreur de partage', error));
        } else {
             toast({ title: "Partage simulé", description: "Le message de parrainage a été copié dans votre presse-papiers." });
             navigator.clipboard.writeText(`Utilisez mon code de parrainage ${referralCode} pour obtenir un bonus lors de votre inscription sur PAYTIK !`);
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

export default function Settings({ alias, onBack, onLogout }: SettingsProps) {
    const { toast } = useToast();
    
    const handleLogout = () => {
        toast({
            title: "Déconnexion",
            description: "Vous avez été déconnecté avec succès.",
        });
        onLogout();
    }
    
    const handleCallSupport = () => {
        window.location.href = "tel:+221705000505";
    }

    const mainSettings = [
        { icon: <Share2 className="h-6 w-6 mr-4 text-primary" />, text: "Inviter un ami à rejoindre PAYTIK", asChild: true },
        { icon: <Ticket className="h-6 w-6 mr-4 text-primary" />, text: "Utiliser le code promotionnel", asChild: true },
    ];
    
    const supportSettings = [
        { icon: <Phone className="h-6 w-6 mr-4 text-primary" />, text: "Contactez le service client", onClick: handleCallSupport },
        { icon: <FileCheck className="h-6 w-6 mr-4 text-primary" />, text: "Vérifiez votre plafond", asChild: true },
        { icon: <MapPin className="h-6 w-6 mr-4 text-primary" />, text: "Marchands à proximité" },
    ];
    
    const securitySettings = [
        { 
            icon: <Smartphone className="h-6 w-6 mr-4 text-primary" />,
            text: "Vos appareils connectés",
            asChild: true,
        },
        { 
            icon: <ShieldCheck className="h-6 w-6 mr-4 text-primary" />, 
            text: "Modifiez votre code secret",
            asChild: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button onClick={onBack} variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-primary">Paramètres</h2>
                </div>
            </div>

            <Card>
                 <Dialog>
                    <DialogTrigger asChild>
                        <SettingItem {...mainSettings[0]} />
                    </DialogTrigger>
                    <InviteFriendDialog alias={alias}/>
                </Dialog>
                <hr className="ml-14"/>
                <Dialog>
                    <DialogTrigger asChild>
                        <SettingItem {...mainSettings[1]} />
                    </DialogTrigger>
                    <PromoCodeDialog />
                </Dialog>
            </Card>

            <h3 className="text-lg font-semibold text-muted-foreground px-4">Support</h3>
             <Card>
                <SettingItem {...supportSettings[0]} />
                <hr className="ml-14"/>
                <Dialog>
                     <DialogTrigger asChild>
                        <SettingItem {...supportSettings[1]} />
                    </DialogTrigger>
                    <LimitsDialog />
                </Dialog>
                <hr className="ml-14"/>
                <SettingItem {...supportSettings[2]} />
            </Card>
            
            <h3 className="text-lg font-semibold text-muted-foreground px-4">Sécurité</h3>
             <Card>
                 <Dialog>
                    <DialogTrigger asChild>
                       <SettingItem {...securitySettings[0]} />
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Appareils Connectés</DialogTitle>
                            <DialogDescription>
                                Voici la liste des appareils où votre compte est actuellement actif.
                            </DialogDescription>
                        </DialogHeader>
                        <ConnectedDevices />
                    </DialogContent>
                </Dialog>
                <hr className="ml-14"/>
                <Dialog>
                    <DialogTrigger asChild>
                        <SettingItem {...securitySettings[1]}/>
                    </DialogTrigger>
                     <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Changer votre code secret</DialogTitle>
                            <DialogDescription>
                                Pour des raisons de sécurité, veuillez fournir votre ancien code PIN avant d'en définir un nouveau.
                            </DialogDescription>
                        </DialogHeader>
                        <ChangePinForm alias={alias} />
                    </DialogContent>
                </Dialog>
            </Card>

             <Card>
                 <SettingItem 
                    icon={<LogOut className="h-6 w-6 mr-4 text-destructive" />} 
                    text={`Se déconnecter (${alias})`}
                    onClick={handleLogout}
                    isDestructive
                 />
            </Card>
            
            <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>PAYTIK Digital Finance</p>
                <p>Version 1.0.0</p>
                <p>Conditions Générales | Avis de Confidentialité</p>
            </div>

        </div>
    );
}
