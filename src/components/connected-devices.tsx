
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Monitor, Smartphone, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

type Device = {
    id: string;
    type: 'desktop' | 'mobile';
    name: string;
    location: string;
    lastSeen: string;
    isCurrent: boolean;
};

const initialDevices: Device[] = [
    { id: '1', type: 'desktop', name: 'Chrome sur Windows', location: 'Dakar, Sénégal', lastSeen: 'Aujourd\'hui à 14:30', isCurrent: true },
    { id: '2', type: 'mobile', name: 'iPhone 15 Pro', location: 'Paris, France', lastSeen: 'Hier à 20:15', isCurrent: false },
    { id: '3', type: 'mobile', name: 'Android (Samsung)', location: 'Dakar, Sénégal', lastSeen: 'Il y a 3 jours', isCurrent: false },
];

const devicesStorageKey = 'midi_connected_devices';

export default function ConnectedDevices() {
    const [devices, setDevices] = useState<Device[]>([]);

    useEffect(() => {
        const storedDevices = localStorage.getItem(devicesStorageKey);
        if (storedDevices) {
            setDevices(JSON.parse(storedDevices));
        } else {
            setDevices(initialDevices);
        }
    }, []);

    const handleDisconnect = (deviceId: string) => {
        const updatedDevices = devices.filter(d => d.id !== deviceId);
        setDevices(updatedDevices);
        localStorage.setItem(devicesStorageKey, JSON.stringify(updatedDevices));
        toast({
            title: "Appareil déconnecté",
            description: "L'accès a été révoqué pour cet appareil.",
        });
    };

    return (
        <div className="space-y-4 pt-4">
            {devices.map(device => (
                <div key={device.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    {device.type === 'desktop' ? <Monitor className="h-8 w-8 text-muted-foreground" /> : <Smartphone className="h-8 w-8 text-muted-foreground" />}
                    <div className="flex-grow">
                        <p className="font-semibold">{device.name} {device.isCurrent && <span className="text-xs font-normal text-primary">(cet appareil)</span>}</p>
                        <p className="text-sm text-muted-foreground">{device.location} &middot; {device.lastSeen}</p>
                    </div>
                    {!device.isCurrent && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Déconnecter cet appareil ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir déconnecter l'appareil "{device.name}" ? Si vous ne le reconnaissez pas, nous vous recommandons également de changer votre code secret.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDisconnect(device.id)} className="bg-destructive hover:bg-destructive/90">
                                        Déconnecter
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            ))}
            {devices.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                    Aucun autre appareil n'est connecté.
                </p>
            )}
        </div>
    );
}
