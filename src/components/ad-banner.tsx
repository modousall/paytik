
"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { Button } from "./ui/button"
import { X } from "lucide-react"

const initialAds = [
    {
        id: 1,
        image: "https://placehold.co/800x400.png",
        imageHint: "friends sharing money",
        title: "Parrainez un ami, gagnez 500 Fcfa !",
        description: "Invitez vos amis à rejoindre PAYTIK et recevez une récompense pour chaque ami qui crée un compte.",
        cta: "Inviter maintenant",
        color: "from-blue-500 to-indigo-600"
    },
    {
        id: 2,
        image: "https://placehold.co/800x400.png",
        imageHint: "supermarket checkout",
        title: "Vos courses moins chères avec PAYTIK",
        description: "Bénéficiez de 5% de réduction dans tous les supermarchés partenaires en payant avec votre QR code PAYTIK.",
        cta: "Voir les offres",
        color: "from-amber-500 to-orange-600"
    },
    {
        id: 3,
        image: "https://placehold.co/800x400.png",
        imageHint: "bank credit card",
        title: "Connectez votre compte bancaire",
        description: "Rechargez votre solde PAYTIK instantanément et en toute sécurité depuis votre compte bancaire.",
        cta: "Lier mon compte",
        color: "from-emerald-500 to-green-600"
    }
]

export default function AdBanner() {
  const [ads, setAds] = React.useState(initialAds);
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  const handleDismiss = (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent carousel interaction
    setAds(currentAds => currentAds.filter(ad => ad.id !== id));
  }

  if (ads.length === 0) {
    return null; // Don't render the carousel if there are no ads
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
              <Card className="overflow-hidden border-none shadow-lg relative group">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 z-10 h-6 w-6 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDismiss(ad.id, e)}
                 >
                     <X size={14}/>
                     <span className="sr-only">Fermer</span>
                 </Button>
                <CardContent className={`flex flex-col sm:flex-row items-center p-0 bg-gradient-to-r ${ad.color} text-white`}>
                    <div className="w-full sm:w-1/2 p-4 md:p-6 space-y-2 order-2 sm:order-1">
                        <h3 className="text-lg md:text-xl font-bold leading-tight">{ad.title}</h3>
                        <p className="text-xs md:text-sm opacity-90">{ad.description}</p>
                        <Button variant="secondary" size="sm" className="mt-2 text-xs">{ad.cta}</Button>
                    </div>
                    <div className="w-full sm:w-1/2 h-32 sm:h-40 relative order-1 sm:order-2">
                        <Image 
                            src={ad.image} 
                            alt={ad.title} 
                            fill
                            style={{objectFit: 'cover'}}
                            data-ai-hint={ad.imageHint}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/40 to-transparent"></div>
                    </div>
                </CardContent>
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
