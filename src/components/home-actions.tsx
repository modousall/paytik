
"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
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
    alias: string;
    userInfo: UserInfo;
};

export default function HomeActions({ onSendClick, alias, userInfo }: HomeActionsProps) {
    return (
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="lg" className="h-16 w-full shadow-sm">
                        <ArrowDown className="mr-2"/> Recevoir
                    </Button>
                </SheetTrigger>
                <SheetContent className="p-0">
                    <QrCodeDisplay alias={alias} userInfo={userInfo} />
                </SheetContent>
            </Sheet>
            
            <Button size="lg" className="h-16 w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" onClick={onSendClick}>
                <ArrowUp className="mr-2"/> Payer & Transférer
            </Button>
        </div>
    )
}
