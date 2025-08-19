
"use client";

import { Button } from "@/components/ui/button";
import { Bell, QrCode, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import QrCodeDisplay from './qr-code-display';


type UserInfo = {
    name: string;
    email: string;
};
  
type HeaderProps = { 
    userInfo: UserInfo; 
    alias: string; 
    onLogout: () => void;
};

export default function Header({ userInfo, alias, onLogout }: HeaderProps) {
    return (
        <header className="bg-background p-4 sm:p-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${userInfo.email}`} alt={userInfo.name} data-ai-hint="person face" />
                    <AvatarFallback>{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="font-bold text-lg text-primary">PAYTIK</div>
            </div>
            <div className="flex items-center gap-2">
                <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon"><QrCode /></Button>
                </SheetTrigger>
                <SheetContent className="p-0">
                    <QrCodeDisplay alias={alias} userInfo={userInfo} />
                </SheetContent>
                </Sheet>
                <Button variant="ghost" size="icon"><Bell /></Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <LogOut />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
                        <AlertDialogDescription>
                        Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à nouveau à votre compte.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={onLogout} className="bg-destructive hover:bg-destructive/90">
                            Se déconnecter
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
        </header>
    );
}
