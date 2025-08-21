
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
import { Calendar as CalendarIcon, UploadCloud, FileCheck, User, Building } from 'lucide-react';
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

type KycStep = 'personal' | 'identity' | 'documents';

export default function KYCForm({ onKycComplete }: KYCFormProps) {
    const [step, setStep] = useState<KycStep>('personal');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState<Date | undefined>();
    const [address, setAddress] = useState('');

    const [idType, setIdType] = useState('');
    const [idNumber, setIdNumber] = useState('');

    const [idFront, setIdFront] = useState<File | null>(null);
    const [idBack, setIdBack] = useState<File | null>(null);
    const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
    
    const { toast } = useToast();
  
    const handleFileSelect = (file: File | null, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (file) {
            setter(file);
            toast({
                title: "Fichier sélectionné",
                description: `${file.name} est prêt à être envoyé.`,
            });
        }
    };

    const FileUploadButton = ({
      label,
      value,
      onFileSelect,
    }: {
      label: string;
      value: File | null;
      onFileSelect: (file: File | null) => void;
    }) => (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(label.replace(/\s+/g, '-'))?.click()}
            className="flex-grow justify-start"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            {value ? "Changer le fichier" : "Choisir un fichier"}
          </Button>
          <input
            type="file"
            id={label.replace(/\s+/g, '-')}
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files ? e.target.files[0] : null)}
          />
          {value && <FileCheck className="h-5 w-5 text-green-500" />}
        </div>
        {value && <p className="text-xs text-muted-foreground">{value.name}</p>}
      </div>
    );

    const renderStep = () => {
        switch(step) {
            case 'personal':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <User />
                            <h3 className="font-semibold">Informations Personnelles</h3>
                        </div>
                        <div><Label htmlFor="name">Nom complet</Label><Input id="name" type="text" placeholder="ex: Fatoumata Diop" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                        <div><Label htmlFor="email">Adresse e-mail</Label><Input id="email" type="email" placeholder="ex: fatou.diop@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <div><Label htmlFor="address">Adresse</Label><Input id="address" type="text" placeholder="ex: 123 Sicap Liberté, Dakar" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
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
                        <Button onClick={() => setStep('identity')} className="w-full" disabled={!name || !email || !birthDate || !address}>Suivant</Button>
                    </div>
                );
            case 'identity':
                return (
                    <div className="space-y-4">
                         <div className="flex items-center gap-2 text-primary mb-2">
                            <Building />
                            <h3 className="font-semibold">Justificatif d'Identité</h3>
                        </div>
                        <div>
                            <Label>Type de pièce</Label>
                            <Select value={idType} onValueChange={setIdType}>
                                <SelectTrigger><SelectValue placeholder="Sélectionnez un type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
                                    <SelectItem value="passport">Passeport</SelectItem>
                                    <SelectItem value="driving_license">Permis de Conduire</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="id-number">Numéro de la pièce</Label>
                            <Input id="id-number" type="text" placeholder="Entrez le numéro du document" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={() => setStep('personal')} className="w-full" variant="outline">Précédent</Button>
                             <Button onClick={() => setStep('documents')} className="w-full" disabled={!idType || !idNumber}>Suivant</Button>
                        </div>
                    </div>
                );
            case 'documents':
                 return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <UploadCloud />
                            <h3 className="font-semibold">Télécharger les Justificatifs</h3>
                        </div>
                        <FileUploadButton label="Pièce d'identité (Recto)" value={idFront} onFileSelect={(f) => handleFileSelect(f, setIdFront)} />
                        <FileUploadButton label="Pièce d'identité (Verso)" value={idBack} onFileSelect={(f) => handleFileSelect(f, setIdBack)} />
                        <FileUploadButton label="Justificatif de domicile" value={proofOfAddress} onFileSelect={(f) => handleFileSelect(f, setProofOfAddress)} />
                         <div className="flex gap-2">
                            <Button onClick={() => setStep('identity')} className="w-full" variant="outline">Précédent</Button>
                            <Button onClick={() => onKycComplete({ name, email })} className="w-full" disabled={!idFront || !idBack || !proofOfAddress}>Terminer et vérifier</Button>
                        </div>
                    </div>
                );
        }
    }
    
    const progressValue = step === 'personal' ? 33 : step === 'identity' ? 66 : 100;
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <Card className="w-full max-w-md">
              <CardHeader>
                  <CardTitle>Vérification de votre profil</CardTitle>
                  <CardDescription>
                      Pour votre sécurité, nous avons besoin de quelques informations supplémentaires.
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
