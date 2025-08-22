
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Calendar as CalendarIcon, UploadCloud, FileCheck, User, Building, Camera, Check, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Progress } from './ui/progress';

type UserInfo = {
    name: string;
    email: string;
};

type KYCFormProps = { 
    onKycComplete: (info: UserInfo) => void 
};

type KycStep = 'personal' | 'identity';

export default function KYCForm({ onKycComplete }: KYCFormProps) {
    const [step, setStep] = useState<KycStep>('personal');

    // Personal Info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState<Date | undefined>();
    const [address, setAddress] = useState('');

    // Identity Docs
    const [idType, setIdType] = useState('cni');
    const [idNumber, setIdNumber] = useState('');
    
    // Simulation states
    const [idFrontScanned, setIdFrontScanned] = useState(false);
    const [idBackScanned, setIdBackScanned] = useState(false);
    const [faceScanned, setFaceScanned] = useState(false);
    const [addressProofUploaded, setAddressProofUploaded] = useState(false);
    
    const { toast } = useToast();
  
    const handleScan = (setter: React.Dispatch<React.SetStateAction<boolean>>, docName: string) => {
        setter(true);
        toast({
            title: `${docName} Scanné`,
            description: "Le document a été capturé avec succès (simulation).",
        });
    };

    const handleUpload = (setter: React.Dispatch<React.SetStateAction<boolean>>, docName: string) => {
        setter(true);
        toast({
            title: `${docName} Téléversé`,
            description: "Le justificatif a été envoyé avec succès (simulation).",
        });
    };

    const CameraButton = ({ label, value, onScan }: { label: string, value: boolean, onScan: () => void }) => (
        <Button type="button" variant="outline" onClick={onScan} className="w-full justify-between h-14">
            <div className="flex items-center gap-3">
                <Camera className="h-6 w-6 text-primary" />
                <span className="text-base">{label}</span>
            </div>
            {value && <Check className="h-6 w-6 text-green-500" />}
        </Button>
    );

    const UploadButton = ({ label, value, onUpload }: { label: string, value: boolean, onUpload: () => void }) => (
        <Button type="button" variant="outline" onClick={onUpload} className="w-full justify-between h-14">
            <div className="flex items-center gap-3">
                <UploadCloud className="h-6 w-6 text-primary" />
                <span className="text-base">{label}</span>
            </div>
            {value && <Check className="h-6 w-6 text-green-500" />}
        </Button>
    );

    const renderStep = () => {
        switch(step) {
            case 'personal':
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="font-semibold text-lg">Informations Personnelles</h3>
                            <p className="text-sm text-muted-foreground">Étape 1 sur 2</p>
                        </div>
                        <div><Label htmlFor="name">Nom complet</Label><Input id="name" type="text" placeholder="ex: Fatoumata Diop" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                        <div><Label htmlFor="email">Adresse e-mail</Label><Input id="email" type="email" placeholder="ex: fatou.diop@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <div>
                            <Label>Date de naissance</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {birthDate ? format(birthDate, "d MMMM yyyy", { locale: fr }) : <span>Sélectionnez une date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={birthDate} onSelect={setBirthDate} captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear() - 18} /></PopoverContent>
                            </Popover>
                        </div>
                        <div><Label htmlFor="address">Adresse</Label><Input id="address" type="text" placeholder="ex: 123 Sicap Liberté, Dakar" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
                        <Button onClick={() => setStep('identity')} className="w-full" disabled={!name || !email || !birthDate || !address}>
                            Suivant <ArrowRight className="ml-2" />
                        </Button>
                    </div>
                );
            case 'identity':
                 return (
                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="font-semibold text-lg">Justificatifs d'Identité</h3>
                             <p className="text-sm text-muted-foreground">Étape 2 sur 2</p>
                        </div>
                        
                        <div className="space-y-2 p-4 border rounded-lg">
                           <Label>Pièce d'Identité Nationale</Label>
                           <CameraButton label="Scanner le Recto" value={idFrontScanned} onScan={() => handleScan(setIdFrontScanned, "Recto CNI")} />
                           <CameraButton label="Scanner le Verso" value={idBackScanned} onScan={() => handleScan(setIdBackScanned, "Verso CNI")} />
                        </div>

                         <div className="space-y-2 p-4 border rounded-lg">
                           <Label>Vérification faciale</Label>
                           <CameraButton label="Prendre un selfie" value={faceScanned} onScan={() => handleScan(setFaceScanned, "Selfie")} />
                        </div>
                        
                         <div className="space-y-2 p-4 border rounded-lg">
                           <Label>Justificatif de domicile (optionnel)</Label>
                            <UploadButton label="Facture, certificat, etc." value={addressProofUploaded} onUpload={() => handleUpload(setAddressProofUploaded, "Justificatif de domicile")} />
                        </div>

                         <div className="flex gap-2">
                            <Button onClick={() => setStep('personal')} className="w-full" variant="outline">Précédent</Button>
                            <Button onClick={() => onKycComplete({ name, email })} className="w-full" disabled={!idFrontScanned || !idBackScanned || !faceScanned}>
                                Terminer et vérifier
                            </Button>
                        </div>
                    </div>
                );
        }
    }
    
    const progressValue = step === 'personal' ? 50 : 100;
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <Card className="w-full max-w-md">
              <CardHeader>
                  <CardTitle>Vérification de votre profil</CardTitle>
                  <CardDescription>
                      Pour votre sécurité et conformément à la réglementation, nous avons besoin de quelques informations supplémentaires.
                  </CardDescription>
                  <Progress value={progressValue} className="mt-2" />
              </CardHeader>
              <CardContent>
                  {renderStep()}
              </CardContent>
          </Card>
      </div>
    );
  };
