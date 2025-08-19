"use client";

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VideoOff, Loader2 } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScannerState, QrCodeError } from 'html5-qrcode';

type QRCodeScannerProps = {
    onScan: (decodedText: string) => void;
};

const QRCodeScanner = ({ onScan }: QRCodeScannerProps) => {
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'error' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const containerId = 'qr-reader';
        const qrScanner = new Html5Qrcode(containerId, { experimentalFeatures: { useBarCodeDetectorIfSupported: true } });

        const startScanner = async () => {
            setScanState('idle');
            setErrorMessage(null);
            
            try {
                 const devices = await Html5Qrcode.getCameras();
                 if (!devices || devices.length === 0) {
                     throw new Error("Aucun appareil photo trouvé.");
                 }

                const qrCodeSuccessCallback = (decodedText: string) => {
                    setScanState('success');
                    onScan(decodedText);
                    if (qrScanner.getState() === Html5QrcodeScannerState.SCANNING) {
                        qrScanner.stop().catch(err => console.error("Impossible d'arrêter le scanner", err));
                    }
                };

                const qrCodeErrorCallback = (error: QrCodeError) => {
                    // This callback is often called when no QR code is in the frame. We can ignore these.
                };

                await qrScanner.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    qrCodeSuccessCallback,
                    qrCodeErrorCallback as (errorMessage: string, error: QrCodeError) => void
                );
                setScanState('scanning');

            } catch (err: any) {
                 if (err.name === 'NotAllowedError') {
                    setErrorMessage("L'accès à la caméra a été refusé. Veuillez l'autoriser dans les paramètres de votre navigateur.");
                } else if (err.name === 'NotFoundError') {
                     setErrorMessage("Aucun appareil photo compatible n'a été trouvé.");
                } else {
                    setErrorMessage("Une erreur est survenue lors du démarrage du scanner: " + (err.message || err));
                }
                setScanState('error');
            }
        };

        startScanner();

        return () => {
            if (qrScanner && qrScanner.getState() === Html5QrcodeScannerState.SCANNING) {
                qrScanner.stop().catch(err => {
                    console.error("Nettoyage: Impossible d'arrêter le scanner", err);
                });
            }
        };
    }, [onScan]);


    return (
        <div className="p-4 space-y-4">
            <div id="qr-reader-container" className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center text-muted-foreground">
                <div id="qr-reader" className='w-full'></div>
                {scanState === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin h-8 w-8" />
                        <p>Démarrage du scanner...</p>
                    </div>
                )}
            </div>
           
            {scanState === 'error' && (
                <Alert variant="destructive">
                    <VideoOff className="h-4 w-4" />
                    <AlertTitle>Erreur de caméra</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}

export default QRCodeScanner;
