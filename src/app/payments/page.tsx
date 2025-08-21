import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, ArrowLeft } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

const features = [
    {
      title: "Instantanéité",
      description: "Envoyez et recevez de l'argent en quelques secondes, 24/7.",
    },
    {
      title: "Frais Justes",
      description: "Des coûts de transaction minimes et clairement affichés. Pas de surprises.",
    },
    {
        title: "Paiements Simplifiés",
        description: "Utilisez un simple alias, un numéro de téléphone ou un QR code pour toutes vos transactions.",
      },
];

export default function PaymentsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
             <main className="flex-grow container mx-auto px-4 py-12 md:py-24">
                <div className="text-center mb-12">
                    <Zap className="mx-auto h-16 w-16 text-primary mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">Paiements Instantanés et Éthiques</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        L'argent circule librement, en toute confiance.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-12 items-center">
                     <div className="flex justify-center">
                        <Image
                            src="https://placehold.co/600x400.png"
                            alt="Illustration de paiement mobile"
                            width={500}
                            height={400}
                            className="rounded-xl shadow-2xl"
                            data-ai-hint="mobile payment phone"
                        />
                    </div>
                    <div className="space-y-8">
                         {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <ArrowRight className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                                    <p className="text-muted-foreground mt-1">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="text-center mt-16">
                     <Link href="/">
                        <Button size="lg" className="h-12 text-base">
                             <ArrowLeft className="mr-2"/> Retour à l'accueil
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}