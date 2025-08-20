
"use client";

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Share2, Copy, ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SheetHeader, SheetTitle } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import QRCodeScanner from './qr-code-scanner';

type UserInfo = {
    name: string;
    email: string;
};

type QrCodeDisplayProps = {
  alias: string;
  userInfo: UserInfo;
  simpleMode?: boolean; // New prop to control UI complexity
};

export default function QrCodeDisplay({ alias, userInfo, simpleMode = false }: QrCodeDisplayProps) {
  const { toast } = useToast();
  // QR Code payload as per spec would be more complex. Here, we'll just encode the alias.
  // Spec mentions: champ Merchant Channel (ID 11) du QR Code = valeur 731.
  // This would be part of a structured data format like EMV QRCPS. For simplicity, we create a basic QR.
  const qrData = JSON.stringify({
      shid: alias,
      merchantChannel: 731
  });
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
  
  const handleCopyAlias = () => {
    navigator.clipboard.writeText(alias);
    toast({
        title: "Copié !",
        description: "Votre alias a été copié dans le presse-papiers.",
    });
  }

  const handleScannedCode = (decodedText: string) => {
    toast({
        title: "Code Scanné !",
        description: `Code QR décodé (simulation): ${decodedText}`,
    });
  }

  return (
    <div className="flex flex-col h-full">
        {!simpleMode && (
             <SheetHeader className="p-4">
                <SheetTitle className="sr-only">Afficher le QR Code</SheetTitle>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${userInfo.email}`} alt={userInfo.name} data-ai-hint="person face" />
                        <AvatarFallback>{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{userInfo.name}</h2>
                        <div className="text-muted-foreground flex items-center gap-2">
                            <span>{alias}</span> 
                            <button onClick={handleCopyAlias} className="hover:text-primary"><Copy size={16}/></button>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto"><Share2/></Button>
                </div>
            </SheetHeader>
        )}

        <div className="flex-grow flex items-center justify-center p-4">
            <div className="relative">
                <Image
                    src={qrCodeUrl}
                    width={300}
                    height={300}
                    alt="QR Code PAYTIK"
                    className="rounded-lg"
                    data-ai-hint="qr code"
                    unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-2 rounded-md shadow-md">
                    <span className="font-bold text-lg text-primary">PAYTIK</span>
                  </div>
                </div>
            </div>
        </div>

      {!simpleMode && (
          <div className="mt-auto grid grid-cols-2 gap-2 p-4 border-t">
                <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="py-6"><ScanLine className="mr-2"/>Scanner</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md p-0">
                    <DialogHeader className="p-4">
                        <DialogTitle>Scanner un code QR</DialogTitle>
                    </DialogHeader>
                    <QRCodeScanner onScan={handleScannedCode}/>
                </DialogContent>
                </Dialog>
                <Button className="bg-primary hover:bg-primary/90 py-6">Mon Code</Button>
            </div>
      )}
    </div>
  );
}
