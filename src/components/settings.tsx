
"use client";

import { Button } from "./ui/button";
import { ArrowLeft, ChevronRight, Share2, Sparkles, Phone, FileCheck, MapPin, Smartphone, ShieldCheck, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./ui/card";

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
}

const SettingItem = ({ icon, text, onClick, isDestructive = false }: SettingItemProps) => {
    const { toast } = useToast();
    const handleClick = onClick || (() => {
        toast({
            title: "Fonctionnalité à venir",
            description: `L'option "${text}" sera bientôt disponible.`,
        })
    });
    
    return (
        <button
            onClick={handleClick}
            className={`w-full flex items-center p-4 text-left ${isDestructive ? 'text-destructive' : 'text-foreground'}`}
        >
            {icon}
            <span className="flex-grow">{text}</span>
            {!onClick && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </button>
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

    const mainSettings = [
        { icon: <Share2 className="h-6 w-6 mr-4 text-primary" />, text: "Inviter un ami à rejoindre PAYTIK" },
        { icon: <Sparkles className="h-6 w-6 mr-4 text-primary" />, text: "Utiliser le code promotionnel" },
    ];
    
    const supportSettings = [
        { icon: <Phone className="h-6 w-6 mr-4 text-primary" />, text: "Contactez le service client" },
        { icon: <FileCheck className="h-6 w-6 mr-4 text-primary" />, text: "Vérifiez votre plafond" },
        { icon: <MapPin className="h-6 w-6 mr-4 text-primary" />, text: "Trouvez les agents à proximité" },
    ];
    
    const securitySettings = [
        { icon: <Smartphone className="h-6 w-6 mr-4 text-primary" />, text: "Vos appareils connectés" },
        { icon: <ShieldCheck className="h-6 w-6 mr-4 text-primary" />, text: "Modifiez votre code secret" },
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
                    <>
                     <SettingItem key={item.text} {...item} />
                     {index < mainSettings.length - 1 && <hr className="ml-14"/>}
                    </>
                ))}
            </Card>

            <h3 className="text-lg font-semibold text-muted-foreground px-4">Support</h3>
             <Card>
                {supportSettings.map((item, index) => (
                    <>
                     <SettingItem key={item.text} {...item} />
                     {index < supportSettings.length - 1 && <hr className="ml-14"/>}
                    </>
                ))}
            </Card>
            
            <h3 className="text-lg font-semibold text-muted-foreground px-4">Sécurité</h3>
             <Card>
                {securitySettings.map((item, index) => (
                    <>
                     <SettingItem key={item.text} {...item} />
                     {index < securitySettings.length - 1 && <hr className="ml-14"/>}
                    </>
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
