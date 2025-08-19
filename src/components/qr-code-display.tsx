"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type QrCodeDisplayProps = {
  alias: string;
};

export default function QrCodeDisplay({ alias }: QrCodeDisplayProps) {
  const { toast } = useToast();
  // QR Code payload as per spec would be more complex. Here, we'll just encode the alias.
  // Spec mentions: champ Merchant Channel (ID 11) du QR Code = valeur 731.
  // This would be part of a structured data format like EMV QRCPS. For simplicity, we create a basic QR.
  const qrData = JSON.stringify({
      shid: alias,
      merchantChannel: 731
  });
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

  const handleShare = async () => {
    const shareData = {
        title: 'My PAYTIK QR Code',
        text: `Pay me easily with PAYTIK! My alias is ${alias}`,
        url: window.location.href, // In real app, would be a link to the QR or profile
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback for desktop/browsers not supporting Web Share API
            await navigator.clipboard.writeText(alias);
            toast({
                title: "Copied to clipboard!",
                description: "Your PAYTIK alias has been copied.",
            });
        }
    } catch (err) {
        console.error("Share failed:", err);
        // Fallback for when sharing is cancelled or fails
        await navigator.clipboard.writeText(alias);
        toast({
            title: "Copied to clipboard!",
            description: "Your PAYTIK alias has been copied.",
        });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-primary">Your PAYTIK QR Code</h2>
      <p className="text-muted-foreground mb-6">Share your QR code to receive payments easily.</p>
      <Card className="max-w-sm mx-auto text-center shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <svg role="img" viewBox="0 0 105 21" className="h-6" fill="currentColor"><path d="M10.8 8c.3.3.4.7.4 1s-.1.8-.4 1.1l-6.8 7c-.3.3-.7.4-1.1.4s-.8-.1-1-.4L.4 15c-.3-.3-.4-.7-.4-1.1s.2-.8.4-1.1L5.9 8c.3-.3.7-.4 1-.4s.7.1 1 .4l2.9 3zm24.3-5.2c.4 0 .7.1.9.4.2.2.4.5.4.9s-.1.7-.4.9l-2.9 3-2.9-3c-.3-.3-.4-.6-.4-.9s.2-.7.4-.9.6-.4.9-.4h3.8zm-3.8 15.4c.4 0 .8-.1 1-.4l6.8-7c.3-.3.4-.7.4-1.1s-.2-.8-.4-1.1L30.7 8c-.3-.3-.7-.4-1-.4s-.7.1-1 .4l-5.5 5.7c-.3.3-.4.7-.4 1.1s.1.8.4 1l1.9 2.1c.2.2.6.4 1 .4zM53.1 2.8h3.8c.4 0 .7.1.9.4.3.2.4.5.4.9s-.1.7-.4.9l-2.9 3-2.9-3c-.3-.3-.4-.6-.4-.9s.2-.7.4-.9.6-.4.9-.4zm-3.8 15.4c.4 0 .8-.1 1-.4l6.8-7c.3-.3.4-.7.4-1.1s-.2-.8-.4-1.1l-1.9-2.1c-.2-.2-.6-.4-1-.4s-.8.1-1.1.4l-6.8 7c-.3.3-.4.7-.4 1.1s.1.8.4 1.1l1.9 2.1c.3.2.7.4 1.1.4zM60.1 8l2.9 3c.3.3.4.7.4 1s-.1.8-.4 1.1l-6.8 7c-.3.3-.7.4-1.1.4s-.8-.1-1-.4L49.3 15c-.3-.3-.4-.7-.4-1.1s.2-.8.4-1.1L54.8 8c.3-.3.7-.4 1-.4s.7.1 1.1.4zM80.2 12.5c0-.4.1-.8.4-1.1l6.8-7c.3-.3.7-.4 1-.4s.7.1 1 .4l1.9 2.1c.3.3.4.7.4 1s-.1.8-.4 1.1l-2.9 3 2.9 3c.3.3.4.7.4 1s-.1.8-.4 1.1l-1.9 2.1c-.2.2-.6.4-1 .4s-.8-.1-1-.4l-6.8-7c-.3-.3-.4-.7-.4-1.1zM97.7 2.8h3.8c.4 0 .7.1.9.4.3.2.4.5.4.9s-.1.7-.4.9l-2.9 3-2.9-3c-.3-.3-.4-.6-.4-.9s.2-.7.4-.9.6-.4.9-.4zM70.5 2.8h3.8c.4 0 .7.1.9.4.3.2.4.5.4.9s-.1.7-.4.9l-2.9 3-2.9-3c-.3-.3-.4-.6-.4-.9s.2-.7.4-.9.6-.4.9-.4z"></path></svg>
          </CardTitle>
          <CardDescription>Your Alias: {alias}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="border bg-white p-2 rounded-lg">
            <Image
              src={qrCodeUrl}
              width={250}
              height={250}
              alt="PAYTIK QR Code"
              className="rounded-md"
              data-ai-hint="qr code"
              unoptimized
            />
          </div>
          <Button onClick={handleShare} className="w-full bg-primary hover:bg-primary/90">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
