
"use client";

import React from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, ChevronRight, Share2, Sparkles, Phone, FileCheck, MapPin, Smartphone, ShieldCheck, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import ChangePinForm from './change-pin-form';
import ConnectedDevices from './connected-devices';


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
        { icon: <Share2 className="h-6 w-6 mr-4 text-primary" />, text: "Inviter un ami à rejoindre PAYTIK" },
        { icon: <Sparkles className="h-6 w-6 mr-4 text-primary" />, text: "Utiliser le code promotionnel" },
    ];
    
    const supportSettings = [
        { icon: <Phone className="h-6 w-6 mr-4 text-primary" />, text: "Contactez le service client", onClick: handleCallSupport },
        { icon: <FileCheck className="h-6 w-6 mr-4 text-primary" />, text: "Vérifiez votre plafond" },
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
                {mainSettings.map((item, index) => (
                    <React.Fragment key={item.text}>
                     <SettingItem {...item} />
                     {index < mainSettings.length - 1 && <hr className="ml-14"/>}
                    </React.Fragment>
                ))}
            </Card>

            <h3 className="text-lg font-semibold text-muted-foreground px-4">Support</h3>
             <Card>
                {supportSettings.map((item, index) => (
                    <React.Fragment key={item.text}>
                     <SettingItem {...item} />
                     {index < supportSettings.length - 1 && <hr className="ml-14"/>}
                    </React.Fragment>
                ))}
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
