
"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SheetHeader, SheetTitle } from './ui/sheet';


type UserInfo = {
    name: string;
    email: string;
};

type QrCodeDisplayProps = {
  alias: string;
  userInfo: UserInfo;
};

export default function QrCodeDisplay({ alias, userInfo }: QrCodeDisplayProps) {
  const { toast } = useToast();
  // QR Code payload as per spec would be more complex. Here, we'll just encode the alias.
  // Spec mentions: champ Merchant Channel (ID 11) du QR Code = valeur 731.
  // This would be part of a structured data format like EMV QRCPS. For simplicity, we create a basic QR.
  const qrData = JSON.stringify({
      shid: alias,
      merchantChannel: 731
  });
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
  
  const handleCopyAlias = () => {
    navigator.clipboard.writeText(alias);
    toast({
        title: "Copié !",
        description: "Votre alias a été copié dans le presse-papiers.",
    });
  }

  return (
    <div className="p-4 flex flex-col h-full">
        <SheetHeader>
            <SheetTitle className="sr-only">Afficher le QR Code</SheetTitle>
        </SheetHeader>
        <header className="flex items-center gap-4 mb-8">
            <Avatar className="h-16 w-16">
                <AvatarImage src="https://placehold.co/64x64.png" alt={userInfo.name} data-ai-hint="person face" />
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
        </header>

        <div className="flex-grow flex items-center justify-center">
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

      <div className="mt-auto grid grid-cols-2 gap-2">
            <Button variant="secondary" className="py-6">Scan</Button>
            <Button className="bg-primary hover:bg-primary/90 py-6">Mon Code</Button>
      </div>
    </div>
  );
}
