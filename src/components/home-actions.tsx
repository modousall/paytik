
"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import SplitBill from './split-bill';
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
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center gap-2">
                <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" onClick={onSendClick}><ArrowUp/></Button>
                <span className="text-sm font-medium">Envoyer</span>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <div className="flex flex-col items-center gap-2 cursor-pointer">
                        <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><ArrowDown/></Button>
                        <span className="text-sm font-medium">Recevoir</span>
                    </div>
                </SheetTrigger>
                <SheetContent className="p-0">
                    <QrCodeDisplay alias={alias} userInfo={userInfo} />
                </SheetContent>
            </Sheet>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex flex-col items-center gap-2 cursor-pointer">
                        <Button variant="outline" size="lg" className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><Users/></Button>
                        <span className="text-sm font-medium">Partager</span>
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Partager une dépense</DialogTitle>
                    </DialogHeader>
                    <SplitBill />
                </DialogContent>
            </Dialog>
        </div>
    )
}
