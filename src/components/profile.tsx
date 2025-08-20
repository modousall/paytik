
"use client";

import { useRef } from 'react';
import ManageAlias from "./manage-alias";
import Contacts from "./contacts";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Camera, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAvatar } from '@/hooks/use-avatar';

type UserInfo = {
  name: string;
  email: string;
};

type ProfileProps = {
  userInfo: UserInfo;
  alias: string;
  onLogout: () => void;
  onBack: () => void;
};

export default function Profile({ userInfo, alias, onLogout, onBack }: ProfileProps) {
  const { avatar, setAvatar } = useAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result as string;
        setAvatar(newAvatar);
        toast({
            title: "Photo de profil mise à jour",
            description: "Votre nouvelle photo a été enregistrée.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-6">
            <Button onClick={onBack} variant="ghost" size="icon">
                <ArrowLeft />
            </Button>
            <div>
                <h2 className="text-2xl font-bold text-primary">Profil et Paramètres</h2>
                <p className="text-muted-foreground">Gérez vos informations, contacts et alias.</p>
            </div>
        </div>

        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={avatar ?? `https://i.pravatar.cc/150?u=${userInfo.email}`} alt={userInfo.name} />
                    <AvatarFallback>{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button 
                    onClick={handleEditClick}
                    size="icon" 
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                >
                    <Camera size={16} />
                </Button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange}
                    className="hidden" 
                    accept="image/png, image/jpeg, image/gif"
                />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold">{userInfo.name}</h3>
                <p className="text-muted-foreground">{userInfo.email}</p>
            </div>
        </div>

        <Separator />

        <div>
            <ManageAlias alias={alias} onLogout={onLogout} />
        </div>
        
        <Separator />

        <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Gérer les contacts</h2>
            <p className="text-muted-foreground mb-6">Ajoutez, modifiez ou supprimez vos contacts enregistrés pour des transactions plus rapides.</p>
            <Contacts />
        </div>
    </div>
  );
}
