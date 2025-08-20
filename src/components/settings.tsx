
"use client";

import React from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, ChevronRight, Share2, Phone, FileCheck, MapPin, Smartphone, ShieldCheck, LogOut, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import ChangePinForm from './change-pin-form';
import ConnectedDevices from './connected-devices';
import InviteFriendDialog from './invite-friend-dialog';
import PromoCodeDialog from './promo-code-dialog';
import LimitsDialog from './limits-dialog';


type SettingsProps = {
    alias: string;
    onBack: () => void;
    onLogout: () => void;
    onNavigate: (view: 'merchants') => void;
};

type SettingItemProps = {
    icon: React.ReactNode;
    text: string;
    onClick?: () => void;
    isDestructive?: boolean;
}

const SettingItem = ({ icon, text, onClick, isDestructive = false }: SettingItemProps) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center p-4 text-left ${isDestructive ? 'text-destructive' : 'text-foreground'}`}
        >
            {icon}
            <span className="flex-grow">{text}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
    )
}

export default function Settings({ alias, onBack, onLogout, onNavigate }: SettingsProps) {
    
    const handleLogout = () => {
        onLogout();
    }
    
    const handleCallSupport = () => {
        window.location.href = "tel:+221705000505";
    }

    const mainSettings = [
        { id: 'invite', icon: <Share2 className="h-6 w-6 mr-4 text-primary" />, text: "Inviter un ami à rejoindre PAYTIK", content: <InviteFriendDialog alias={alias}/> },
        { id: 'promo', icon: <Ticket className="h-6 w-6 mr-4 text-primary" />, text: "Utiliser le code promotionnel", content: <PromoCodeDialog/> },
    ];
    
    const supportSettings = [
        { id: 'support', icon: <Phone className="h-6 w-6 mr-4 text-primary" />, text: "Contactez le service client", onClick: handleCallSupport },
        { id: 'limits', icon: <FileCheck className="h-6 w-6 mr-4 text-primary" />, text: "Vérifiez votre plafond", content: <LimitsDialog/> },
        { id: 'merchants', icon: <MapPin className="h-6 w-6 mr-4 text-primary" />, text: "Marchands à proximité", onClick: () => onNavigate('merchants') },
    ];
    
    const securitySettings = [
        { id: 'devices', icon: <Smartphone className="h-6 w-6 mr-4 text-primary" />, text: "Vos appareils connectés", content: (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Appareils Connectés</DialogTitle>
                    <DialogDescription>Voici la liste des appareils où votre compte est actuellement actif.</DialogDescription>
                </DialogHeader>
                <ConnectedDevices />
            </DialogContent>
        )},
        { id: 'pin', icon: <ShieldCheck className="h-6 w-6 mr-4 text-primary" />, text: "Modifiez votre code secret", content: (
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Changer votre code secret</DialogTitle>
                    <DialogDescription>Pour des raisons de sécurité, veuillez fournir votre ancien code PIN avant d'en définir un nouveau.</DialogDescription>
                </DialogHeader>
                <ChangePinForm alias={alias} />
            </DialogContent>
        )},
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
                    <React.Fragment key={item.id}>
                       <Dialog>
                            <DialogTrigger asChild>
                               <button className="w-full flex items-center p-4 text-left text-foreground">
                                    {item.icon}
                                    <span className="flex-grow">{item.text}</span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </button>
                           </DialogTrigger>
                           {item.content}
                       </Dialog>
                        {index < mainSettings.length - 1 && <hr className="ml-14"/>}
                    </React.Fragment>
                ))}
            </Card>

            <h3 className="text-lg font-semibold text-muted-foreground px-4">Support</h3>
             <Card>
                {supportSettings.map((item, index) => (
                     <React.Fragment key={item.id}>
                         {item.onClick ? (
                            <SettingItem {...item} />
                         ) : (
                             <Dialog>
                                <DialogTrigger asChild>
                                     <button className="w-full flex items-center p-4 text-left text-foreground">
                                        {item.icon}
                                        <span className="flex-grow">{item.text}</span>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                </DialogTrigger>
                                {item.content}
                             </Dialog>
                         )}
                        {index < supportSettings.length - 1 && <hr className="ml-14"/>}
                    </React.Fragment>
                ))}
            </Card>
            
            <h3 className="text-lg font-semibold text-muted-foreground px-4">Sécurité</h3>
             <Card>
                {securitySettings.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <Dialog>
                            <DialogTrigger asChild>
                                 <button className="w-full flex items-center p-4 text-left text-foreground">
                                    {item.icon}
                                    <span className="flex-grow">{item.text}</span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </button>
                            </DialogTrigger>
                           {item.content}
                        </Dialog>
                        {index < securitySettings.length - 1 && <hr className="ml-14"/>}
                    </React.Fragment>
                ))}
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
