
"use client";

import { useEffect, useRef, useState } from 'react';
import { useCameraPermission } from '@/hooks/use-camera-permission';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Video, VideoOff, Loader2 } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

type QRCodeScannerProps = {
    onScan: (decodedText: string) => void;
};

const QRCodeScanner = ({ onScan }: QRCodeScannerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const { hasPermission, error } = useCameraPermission(videoRef);

    useEffect(() => {
        if (!hasPermission || !videoRef.current || isScanning) {
            return;
        }

        const containerId = 'qr-reader';
        
        // Ensure the container element exists
        let readerContainer = document.getElementById(containerId);
        if (!readerContainer) {
            readerContainer = document.createElement('div');
            readerContainer.id = containerId;
            videoRef.current?.parentNode?.insertBefore(readerContainer, videoRef.current.nextSibling);
        }

        // Hide the video element since Html5Qrcode will create its own
        if (videoRef.current) {
            videoRef.current.style.display = 'none';
        }
        
        const qrScanner = new Html5Qrcode(containerId);
        setIsScanning(true);

        const qrCodeSuccessCallback = (decodedText: string) => {
            onScan(decodedText);
            if (qrScanner.getState() === Html5QrcodeScannerState.SCANNING) {
                qrScanner.stop().catch(err => console.error("Failed to stop scanner", err));
            }
        };

        const qrCodeErrorCallback = (errorMessage: string) => {
           // console.log(`QR Code no longer in front of camera. ${errorMessage}`);
        };

        qrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            qrCodeSuccessCallback,
            qrCodeErrorCallback
        ).catch(err => {
            console.error("Failed to start scanner", err);
        });

        return () => {
            if (qrScanner.getState() === Html5QrcodeScannerState.SCANNING) {
                qrScanner.stop().catch(err => {
                    console.error("Cleanup: Failed to stop scanner", err);
                });
            }
        };
    }, [hasPermission, onScan, isScanning]);


    return (
        <div className="p-4 space-y-4">
            <div id="qr-reader-container" className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center text-muted-foreground">
                 {/* This div is where the scanner will be rendered */}
                 <div id="qr-reader" className='w-full'></div>

                {/* We keep the videoRef for the permission hook, but it can be hidden */}
                <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover hidden" 
                    autoPlay 
                    muted 
                    playsInline
                />

                {!isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin h-8 w-8" />
                        <p>Démarrage du scanner...</p>
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
        </div>
    );
}

export default QRCodeScanner;
