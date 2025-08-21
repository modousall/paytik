
"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, PlusCircle, Landmark, ScanLine, Share2, HandCoins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QrCodeDisplay from "./qr-code-display";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import QRCodeScanner from "./qr-code-scanner";
import { useState } from "react";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";


type UserInfo = {
    name: string;
    email: string;
    role: 'user' | 'merchant' | 'admin' | 'superadmin' | 'support';
};

type HomeActionsProps = { 
    onSendClick: () => void; 
    onRechargeClick: () => void;
    onFinancingClick: () => void;
    alias: string;
    userInfo: UserInfo;
};

const paymentRequestSchema = z.object({
    amount: z.coerce.number().positive("Le montant doit être positif."),
    reason: z.string().optional(),
});
type PaymentRequestValues = z.infer<typeof paymentRequestSchema>;

const RequestPaymentDialogContent = ({ alias, userInfo, onGenerate }: { alias: string, userInfo: UserInfo, onGenerate: (link: string) => void }) => {
    const form = useForm<PaymentRequestValues>({
        resolver: zodResolver(paymentRequestSchema),
        defaultValues: { amount: undefined, reason: "" },
    });

    const onSubmit = (values: PaymentRequestValues) => {
        const params = new URLSearchParams({
            to: alias,
            amount: values.amount.toString(),
            reason: values.reason || `Paiement pour ${userInfo.name}`
        });
        const paymentLink = `${window.location.origin}?pay=${params.toString()}`;
        onGenerate(paymentLink);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Montant (F)</FormLabel>
                        <FormControl><Input type="number" placeholder="ex: 1500" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="reason" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Raison / Description (Optionnel)</FormLabel>
                        <FormControl><Input placeholder="ex: Facture #42" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-4">
                    <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
                    <Button type="submit">Générer le lien</Button>
                </div>
            </form>
        </Form>
    );
}

export default function HomeActions({ onSendClick, onRechargeClick, onFinancingClick, alias, userInfo }: HomeActionsProps) {
    const { toast } = useToast();
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);

    const handlePlaceholderClick = (featureName: string) => {
        toast({
            title: "Fonctionnalité en cours de développement",
            description: `La fonctionnalité "${featureName}" sera bientôt disponible pour les marchands.`,
        });
    };
    
    const handleScannedCode = (decodedText: string) => {
        setIsScannerOpen(false);
        toast({ title: "Code Scanné", description: `Code: ${decodedText}` });
    };

    const handleShareLink = () => {
        if (!paymentLink) return;
        if (navigator.share) {
            navigator.share({
                title: 'Demande de paiement Midi',
                text: `Veuillez me payer en utilisant ce lien : ${paymentLink}`,
                url: paymentLink,
            });
        } else {
            navigator.clipboard.writeText(paymentLink);
            toast({ title: "Lien copié !", description: "Le lien de paiement a été copié dans le presse-papiers." });
        }
    };
    
    if (userInfo.role === 'merchant') {
        return (
             <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 max-w-lg mx-auto">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="lg" className="h-20 sm:h-16 w-full shadow-sm flex-col gap-1">
                            <ArrowDown/> Recevoir
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xs">
                        <DialogHeader>
                            <DialogTitle className="text-center">Mon Code Marchand</DialogTitle>
                        </DialogHeader>
                        <QrCodeDisplay alias={alias} userInfo={userInfo} simpleMode={true} />
                    </DialogContent>
                </Dialog>
                
                <Dialog onOpenChange={(open) => !open && setPaymentLink(null)}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="h-20 sm:h-16 w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm flex-col gap-1">
                            <Share2/> Demander
                        </Button>
                    </DialogTrigger>
                     {paymentLink ? (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Lien de Paiement Généré</DialogTitle>
                                <DialogDescription>Partagez ce lien avec votre client pour qu'il puisse vous payer facilement.</DialogDescription>
                            </DialogHeader>
                            <Input readOnly value={paymentLink} />
                            <DialogFooter>
                                <Button variant="secondary" onClick={handleShareLink}><Share2 className="mr-2"/> Partager</Button>
                            </DialogFooter>
                        </DialogContent>
                    ) : (
                        <DialogContent>
                            <DialogHeader><DialogTitle>Demander un paiement</DialogTitle></DialogHeader>
                            <RequestPaymentDialogContent alias={alias} userInfo={userInfo} onGenerate={setPaymentLink} />
                        </DialogContent>
                    )}
                </Dialog>

                <Button size="lg" variant="secondary" className="h-20 sm:h-16 w-full shadow-sm flex-col gap-1" onClick={() => handlePlaceholderClick("Retrait")}>
                    <Landmark/> Retirer
                </Button>
            </div>
        )
    }

    // Client View
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 max-w-lg mx-auto">
             <Dialog>
                <DialogTrigger asChild>
                     <Button variant="outline" size="lg" className="h-20 sm:h-16 w-full shadow-sm flex-col gap-1">
                        <ArrowDown/> Recevoir
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xs p-4">
                     <DialogHeader className="mb-4">
                        <DialogTitle className="text-center">Mon Code Midi</DialogTitle>
                    </DialogHeader>
                    <QrCodeDisplay alias={alias} userInfo={userInfo} simpleMode={true} />
                     <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                      <DialogTrigger asChild>
                          <Button variant="secondary" className="w-full mt-4"><ScanLine className="mr-2"/>Scanner un code</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md p-0">
                          <DialogHeader className="p-4"><DialogTitle>Scanner un code QR</DialogTitle></DialogHeader>
                          <QRCodeScanner onScan={handleScannedCode}/>
                      </DialogContent>
                    </Dialog>
                </DialogContent>
            </Dialog>
            
            <Button size="lg" className="h-20 sm:h-16 w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm flex-col gap-1" onClick={onSendClick}>
                <ArrowUp/> Payer
            </Button>

            <Button size="lg" className="h-20 sm:h-16 w-full shadow-sm flex-col gap-1" onClick={onRechargeClick}>
                <PlusCircle/> Dépôt
            </Button>
                       
            <Button size="lg" variant="secondary" className="h-20 sm:h-16 w-full shadow-sm flex-col gap-1" onClick={onFinancingClick}>
                <HandCoins/> Financement
            </Button>
        </div>
    )
}
