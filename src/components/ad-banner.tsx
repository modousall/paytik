
"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"

import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "./ui/button"
import { X } from "lucide-react"

type Ad = {
  id: number;
  type: 'image' | 'video';
  mediaSrc: string;
  imageHint: string;
  title: string;
  description: string;
  cta: string;
  color: string;
};

const initialAds: Ad[] = [
    {
        id: 1,
        type: 'image',
        mediaSrc: "https://placehold.co/800x400.png",
        imageHint: "friends sharing money",
        title: "Parrainez un ami, gagnez 500 Fcfa !",
        description: "Invitez vos amis à rejoindre PAYTIK et recevez une récompense pour chaque ami qui crée un compte.",
        cta: "Inviter maintenant",
        color: "from-blue-500 to-indigo-600"
    },
    {
        id: 2,
        type: 'video',
        mediaSrc: "https://videos.pexels.com/video-files/3209828/3209828-sd_640_360_25fps.mp4",
        imageHint: "woman shopping online",
        title: "Payez en ligne en toute sécurité",
        description: "Utilisez votre carte virtuelle PAYTIK pour vos achats sur tous vos sites préférés.",
        cta: "Voir ma carte",
        color: "from-purple-500 to-pink-600"
    },
    {
        id: 3,
        type: 'image',
        mediaSrc: "https://placehold.co/800x400.png",
        imageHint: "supermarket checkout",
        title: "Vos courses moins chères avec PAYTIK",
        description: "Bénéficiez de 5% de réduction dans tous les supermarchés partenaires en payant avec votre QR code PAYTIK.",
        cta: "Voir les offres",
        color: "from-amber-500 to-orange-600"
    },
    {
        id: 4,
        type: 'image',
        mediaSrc: "https://placehold.co/800x400.png",
        imageHint: "bank credit card",
        title: "Connectez votre compte bancaire",
        description: "Rechargez votre solde PAYTIK instantanément et en toute sécurité depuis votre compte bancaire.",
        cta: "Lier mon compte",
        color: "from-emerald-500 to-green-600"
    }
]

const DISMISSED_ADS_STORAGE_KEY = 'paytik_dismissed_ads';

export default function AdBanner() {
  const [ads, setAds] = React.useState<Ad[]>([]);
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  React.useEffect(() => {
    const dismissedAds = JSON.parse(localStorage.getItem(DISMISSED_ADS_STORAGE_KEY) || '[]');
    const activeAds = initialAds.filter(ad => !dismissedAds.includes(ad.id));
    setAds(activeAds);
  }, []);

  const handleDismiss = (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent carousel interaction
    event.preventDefault(); // Prevent link navigation if wrapped in <a>
    
    const dismissedAds = JSON.parse(localStorage.getItem(DISMISSED_ADS_STORAGE_KEY) || '[]');
    localStorage.setItem(DISMISSED_ADS_STORAGE_KEY, JSON.stringify([...dismissedAds, id]));
    
    setAds(currentAds => currentAds.filter(ad => ad.id !== id));
  }

  if (ads.length === 0) {
    return null;
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {ads.map((ad) => (
          <CarouselItem key={ad.id}>
            <div className="p-1">
              <Card className={`overflow-hidden border-none shadow-lg relative group bg-gradient-to-r ${ad.color} text-white`}>
                 <Button 
                    variant="ghost" 
                    size="icon"
                    type="button" 
                    className="absolute top-1 right-1 z-20 h-6 w-6 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDismiss(ad.id, e)}
                 >
                     <X size={14}/>
                     <span className="sr-only">Fermer</span>
                 </Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
                    <div className="p-4 space-y-2 order-2 sm:order-1 self-center">
                        <h3 className="text-lg font-bold leading-tight">{ad.title}</h3>
                        <p className="text-xs opacity-90">{ad.description}</p>
                        <Button variant="secondary" size="sm" className="mt-2 text-xs">{ad.cta}</Button>
                    </div>
                    <div className="h-24 sm:h-32 w-full relative order-1 sm:order-2">
                        {ad.type === 'image' ? (
                            <Image 
                                src={ad.mediaSrc} 
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                data-ai-hint={ad.imageHint}
                                width={400}
                                height={200}
                                unoptimized
                            />
                        ) : (
                            <video
                                src={ad.mediaSrc}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-black/20 via-transparent to-transparent"></div>
                    </div>
                </div>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {ads.length > 1 && (
        <>
            <CarouselPrevious className="hidden sm:flex left-2" />
            <CarouselNext className="hidden sm:flex right-2" />
        </>
      )}
    </Carousel>
  )
}
