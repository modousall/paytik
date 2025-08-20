
"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, PlusCircle, Landmark } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import QrCodeDisplay from './qr-code-display';


type UserInfo = {
    name: string;
    email: string;
};

type HomeActionsProps = { 
    onSendClick: () => void; 
    onRechargeClick: () => void;
    onWithdrawClick: () => void;
    alias: string;
    userInfo: UserInfo;
};

export default function HomeActions({ onSendClick, onRechargeClick, onWithdrawClick, alias, userInfo }: HomeActionsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 max-w-lg mx-auto">
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="lg" className="h-20 sm:h-16 w-full shadow-sm flex-col gap-1">
                        <ArrowDown/> Recevoir
                    </Button>
                </SheetTrigger>
                <SheetContent className="p-0">
                    <QrCodeDisplay alias={alias} userInfo={userInfo} />
                </SheetContent>
            </Sheet>
            
            <Button size="lg" className="h-20 sm:h-16 w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm flex-col gap-1" onClick={onSendClick}>
                <ArrowUp/> Payer
            </Button>

            <Button size="lg" className="h-20 sm:h-16 w-full shadow-sm flex-col gap-1" onClick={onRechargeClick}>
                <PlusCircle/> Recharger
            </Button>
            
            <Button size="lg" variant="secondary" className="h-20 sm:h-16 w-full shadow-sm flex-col gap-1" onClick={onWithdrawClick}>
                <Landmark/> Retirer
            </Button>
        </div>
    )
}
