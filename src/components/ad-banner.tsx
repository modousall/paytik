
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

const ads = [
    {
        image: "https://placehold.co/800x400.png",
        imageHint: "woman smiling",
        title: "Transférez sans frais vers l'international",
        description: "Envoyez de l'argent à vos proches à l'étranger avec zéro frais jusqu'à la fin du mois.",
        cta: "En savoir plus",
        color: "from-blue-500 to-indigo-600"
    },
    {
        image: "https://placehold.co/800x400.png",
        imageHint: "delivery service",
        title: "Payez vos livraisons en un clic",
        description: "Réglez vos livreurs partenaires directement depuis l'application PAYTIK.",
        cta: "Voir les partenaires",
        color: "from-amber-500 to-orange-600"
    },
    {
        image: "https://placehold.co/800x400.png",
        imageHint: "mobile phone",
        title: "Besoin de crédit téléphonique ?",
        description: "Rechargez votre crédit ou celui d'un proche instantanément.",
        cta: "Recharger maintenant",
        color: "from-emerald-500 to-green-600"
    }
]

export default function AdBanner() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {ads.map((ad, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="overflow-hidden border-none shadow-lg">
                <CardContent className={`flex flex-col md:flex-row items-center p-0 ${ad.color} text-white`}>
                    <div className="w-full md:w-1/2 p-6 md:p-8 space-y-3">
                        <h3 className="text-xl md:text-2xl font-bold leading-tight">{ad.title}</h3>
                        <p className="text-sm md:text-base opacity-90">{ad.description}</p>
                        <Button variant="secondary" className="mt-2">{ad.cta}</Button>
                    </div>
                    <div className="w-full md:w-1/2 h-48 md:h-full relative">
                        <Image 
                            src={ad.image} 
                            alt={ad.title} 
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={ad.imageHint}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 to-transparent"></div>
                    </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex left-4" />
      <CarouselNext className="hidden sm:flex right-4" />
    </Carousel>
  )
}
