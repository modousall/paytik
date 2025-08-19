
"use client";

import { useRef } from 'react';
import { useCameraPermission } from '@/hooks/use-camera-permission';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Video, VideoOff } from 'lucide-react';
import { Button } from './ui/button';

type QRCodeScannerProps = {
    onScan: (decodedText: string) => void;
};

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { hasPermission, error } = useCameraPermission(videoRef);

    const handleSimulateScan = () => {
        // In a real implementation, a library like jsQR would be used here
        // to decode the QR code from the video stream.
        const simulatedDecodedText = `paytik://user_alias/transaction?amount=1500&reason=cafe`;
        onScan(simulatedDecodedText);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    muted 
                    playsInline
                />
                {hasPermission && (
                     <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-2/3 h-2/3 border-4 border-white/50 rounded-lg" />
                     </div>
                )}
            </div>
           
            {error && (
                <Alert variant="destructive">
                    <VideoOff className="h-4 w-4" />
                    <AlertTitle>Erreur de caméra</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!hasPermission && !error && (
                <Alert>
                    <Video className="h-4 w-4" />
                    <AlertTitle>En attente de la caméra</AlertTitle>
                    <AlertDescription>Veuillez autoriser l'accès à la caméra pour scanner les codes QR.</AlertDescription>
                </Alert>
            )}

            <Button onClick={handleSimulateScan} className="w-full" disabled={!hasPermission}>
                Simuler le scan
            </Button>
        </div>
    );
}
