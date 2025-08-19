
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
                         <svg role="img" viewBox="0 0 105 21" className="h-6 text-black" fill="currentColor"><path d="M10.8 8c.3.3.4.7.4 1s-.1.8-.4 1.1l-6.8 7c-.3.3-.7.4-1.1.4s-.8-.1-1-.4L.4 15c-.3-.3-.4-.7-.4-1.1s.2-.8.4-1.1L5.9 8c.3-.3.7-.4 1-.4s.7.1 1 .4l2.9 3zm24.3-5.2c.4 0 .7.1.9.4.2.2.4.5.4.9s-.1.7-.4.9l-2.9 3-2.9-3c-.3-.3-.4-.6-.4-.9s.2-.7.4-.9.6-.4.9-.4h3.8zm-3.8 15.4c.4 0 .8-.1 1-.4l6.8-7c.3-.3.4-.7.4-1.1s-.2-.8-.4-1.1L30.7 8c-.3-.3-.7-.4-1-.4s-.7.1-1 .4l-5.5 5.7c-.3.3-.4.7-.4 1.1s.1.8.4 1l1.9 2.1c.2.2.6.4 1 .4zM53.1 2.8h3.8c.4 0 .7.1.9.4.3.2.4.5.4.9s-.1.7-.4.9l-2.9 3-2.9-3c-.3-.3-.4-.6-.4-.9s.2-.7.4-.9.6-.4.9-.4zm-3.8 15.4c.4 0 .8-.1 1-.4l6.8-7c.3-.3.4-.7.4-1.1s-.2-.8-.4-1.1l-1.9-2.1c-.2-.2-.6-.4-1-.4s-.8.1-1.1.4l-6.8 7c-.3.3-.4.7-.4 1.1s.1.8.4 1.1l1.9 2.1c.3.2.7.4 1.1.4zM60.1 8l2.9 3c.3.3.4.7.4 1s-.1.8-.4 1.1l-6.8 7c-.3.3-.7.4-1.1.4s-.8-.1-1-.4L49.3 15c-.3-.3-.4-.7-.4-1.1s.2-.8.4-1.1L54.8 8c.3-.3.7-.4 1-.4s.7.1 1.1.4zM80.2 12.5c0-.4.1-.8.4-1.1l6.8-7c.3-.3.7-.4 1-.4s.7.1 1 .4l1.9 2.1c.3.3.4.7.4 1s-.1.8-.4 1.1l-2.9 3 2.9 3c.3.3.4.7.4 1s-.1.8-.4 1.1l-1.9 2.1c-.2.2-.6-.4-1-.4s-.8-.1-1-.4l-6.8-7c-.3-.3-.4-.7-.4-1.1zM97.7 2.8h3.8c.4 0 .7.1.9.4.3.2.4.5.4.9s-.1.7-.4.9l-2.9 3-2.9-3c-.3-.3-.4-.6-.4-.9s.2-.7.4-.9.6-.4.9-.4zM70.5 2.8h3.8c.4 0 .7.1.9.4.3.2.4.5.4.9s-.1.7-.4.9l-2.9 3-2.9-3c-.3-.3-.4-.6-.4-.9s.2-.7.4-.9.6-.4.9-.4z"></path></svg>
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
