"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, DollarSign, Handshake } from "lucide-react";

type OnboardingDemoProps = {
  onComplete: () => void;
};

export default function OnboardingDemo({ onComplete }: OnboardingDemoProps) {
  const features = [
    {
      icon: <Zap className="h-12 w-12 text-primary" />,
      title: "Instant Transactions",
      description: "Experience lightning-fast payment processing for all your needs.",
    },
    {
      icon: <ShieldCheck className="h-12 w-12 text-primary" />,
      title: "Always Available",
      description: "Our interoperable platform is available 24/7, ensuring you can transact anytime.",
    },
    {
      icon: <DollarSign className="h-12 w-12 text-primary" />,
      title: "Affordable Costs",
      description: "Enjoy competitive and transparent transaction fees with PAYTIK.",
    },
    {
      icon: <Handshake className="h-12 w-12 text-primary" />,
      title: "Permissions",
      description: "To enhance your experience, PAYTIK requires access to your contacts and notifications. Your data is safe with us.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">Welcome to PAYTIK</h1>
        <p className="text-center text-muted-foreground mb-8">Your simplified and secure payment solution.</p>
        <Carousel className="w-full">
          <CarouselContent>
            {features.map((feature, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="shadow-lg">
                    <CardContent className="flex flex-col aspect-[4/3] items-center justify-center p-6 text-center">
                      <div className="mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        <Button onClick={onComplete} className="w-full mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
          Get Started
        </Button>
      </div>
    </div>
  );
}
