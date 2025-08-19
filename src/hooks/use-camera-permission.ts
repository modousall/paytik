
"use client";

import { useState, useEffect, RefObject } from 'react';

export function useCameraPermission(videoRef: RefObject<HTMLVideoElement>) {
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getCameraPermission = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("L'API MediaDevices n'est pas prise en charge par ce navigateur.");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                setHasPermission(true);
                setError(null);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // Cleanup function to stop the video stream when the component unmounts
                return () => {
                    stream.getTracks().forEach(track => track.stop());
                };
            } catch (err) {
                console.error('Erreur d\'accès à la caméra:', err);
                if (err instanceof DOMException) {
                    if (err.name === 'NotAllowedError') {
                        setError("L'accès à la caméra a été refusé. Veuillez l'activer dans les paramètres de votre navigateur.");
                    } else if (err.name === 'NotFoundError') {
                        setError("Aucun appareil photo compatible n'a été trouvé.");
                    } else {
                        setError("Une erreur est survenue lors de l'accès à la caméra.");
                    }
                } else {
                    setError("Une erreur inconnue est survenue.");
                }
                setHasPermission(false);
            }
        };

        const cleanupPromise = getCameraPermission();

        return () => {
            cleanupPromise.then(cleanup => {
                if (cleanup) {
                    cleanup();
                }
            });
        };
    }, [videoRef]);

    return { hasPermission, error };
}
