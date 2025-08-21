
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Info, QrCode, CheckCircle, XCircle, Hourglass, CalendarIcon, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import QRCodeScanner from './qr-code-scanner';
import { useBnpl } from '@/hooks/use-bnpl';
import type { BnplAssessmentOutput } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTegSimulator from './admin-teg-simulator';
import type { CreditProposal } from './payment-form';

const bnplFormSchema = z.object({
  merchantAlias: z.string().min(1, { message: "L'alias du marchand est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant de l'achat doit être positif." }),
  downPayment: z.coerce.number().min(0, "L'avance ne peut être négative.").optional(),
  repaymentFrequency: z.string().min(1, "La périodicité est requise."),
  installmentsCount: z.coerce.number().int().positive("Le nombre d'échéances est requis."),
  firstInstallmentDate: z.date({ required_error: "La date de première échéance est requise." }),
  marginRate: z.coerce.number().min(0, "Le taux de marge ne peut être négatif."),
});

type BnplFormValues = z.infer<typeof bnplFormSchema>;

type BnplProps = {
  onBack: () => void;
  prefillData?: CreditProposal | null;
};

const ResultDisplay = ({ result, onBack }: { result: BnplAssessmentOutput, onBack: () => void }) => {
    const statusConfig = {
        approved: {
            icon: <CheckCircle className="h-12 w-12 text-green-500" />,
            title: "Demande Approuvée !",
            alertVariant: "default" as "default",
            description: "Votre demande de paiement échelonné a été approuvée. Vous pouvez maintenant finaliser votre achat auprès du marchand.",
        },
        rejected: {
            icon: <XCircle className="h-12 w-12 text-destructive" />,
            title: "Demande Rejetée",
            alertVariant: "destructive" as "destructive",
            description: "Malheureusement, nous ne pouvons pas approuver votre demande pour le moment.",
        },
        review: {
            icon: <Hourglass className="h-12 w-12 text-blue-500" />,
            title: "Demande en Cours d'Examen",
            alertVariant: "default" as "default",
            description: "Votre demande nécessite un examen manuel. Vous recevrez une notification une fois qu'une décision aura été prise (généralement sous 24h).",
        }
    }
    
    const config = statusConfig[result.status];

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
            {config.icon}
            <h2 className="text-2xl font-bold">{config.title}</h2>
            <Alert variant={config.alertVariant}>
                <AlertTitle className="font-semibold">Raison: {result.reason}</AlertTitle>
                <AlertDescription>
                   {config.description}
                </AlertDescription>
            </Alert>
            
            {result.status === 'approved' && result.repaymentPlan && (
                <div className="w-full p-4 border rounded-lg bg-secondary">
                    <h3 className="font-semibold mb-2">Plan de remboursement suggéré</h3>
                    <p className="text-sm">{result.repaymentPlan}</p>
                </div>
            )}

            <Button onClick={onBack} variant="outline">Retour</Button>
        </div>
    )
}

export default function BNPL({ onBack, prefillData = null }: BnplProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<BnplAssessmentOutput | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  const { submitRequest } = useBnpl();

  const form = useForm<BnplFormValues>({
    resolver: zodResolver(bnplFormSchema),
    defaultValues: {
      merchantAlias: prefillData?.merchantAlias ?? '',
      amount: prefillData?.amount,
      downPayment: prefillData?.downPayment,
      repaymentFrequency: prefillData?.repaymentFrequency ?? "weekly",
      installmentsCount: prefillData?.installmentsCount ?? 17,
      firstInstallmentDate: prefillData?.firstInstallmentDate ? new Date(prefillData.firstInstallmentDate) : undefined,
      marginRate: 0.2856,
    },
  });

  useEffect(() => {
    if (prefillData) {
        form.reset({
            merchantAlias: prefillData.merchantAlias,
            amount: prefillData.amount,
            downPayment: prefillData.downPayment,
            repaymentFrequency: prefillData.repaymentFrequency,
            installmentsCount: prefillData.installmentsCount,
            firstInstallmentDate: new Date(prefillData.firstInstallmentDate),
            marginRate: 0.2856,
        });
        toast({
            title: "Proposition de crédit chargée",
            description: "Vérifiez les détails et soumettez la demande."
        })
    }
  }, [prefillData, form, toast]);

  const onSubmit = async (values: BnplFormValues) => {
    setIsLoading(true);
    try {
      const result = await submitRequest({
          ...values,
          firstInstallmentDate: values.firstInstallmentDate.toISOString(),
      });
      setAssessmentResult(result);
    } catch(e) {
      console.error(e);
      toast({
        title: "Erreur de soumission",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScannedCode = (decodedText: string) => {
    form.setValue('merchantAlias', decodedText, { shouldValidate: true });
    setIsScannerOpen(false);
    toast({ title: "Code Scanné", description: "L'alias du marchand a été inséré." });
  }
  
  const handleReset = () => {
      setAssessmentResult(null);
      form.reset();
      onBack();
  }

  if(assessmentResult) {
    return <ResultDisplay result={assessmentResult} onBack={handleReset} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="icon">
                <ArrowLeft />
            </Button>
            <div>
            <h2 className="text-2xl font-bold text-primary">Credit Marchands (BNPL)</h2>
            <p className="text-muted-foreground">{prefillData ? "Confirmez votre demande de crédit." : "Financez vos achats et payez en plusieurs fois."}</p>
            </div>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <Calculator className="mr-2"/> Simulateur TEG
                </Button>
            </DialogTrigger>
            <AdminTegSimulator />
        </Dialog>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Ce service est soumis à une vérification d'éligibilité par IA. La soumission ne garantit pas l'approbation.
            </AlertDescription>
          </Alert>

          <FormField
            control={form.control}
            name="merchantAlias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias ou Code Marchand</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input placeholder="Entrez l'identifiant du marchand" {...field} readOnly={!!prefillData} className={prefillData ? 'bg-muted' : ''} />
                     <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                      <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon" aria-label="Scanner le QR Code" disabled={!!prefillData}>
                              <QrCode />
                          </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md p-0">
                          <DialogHeader className="p-4">
                              <DialogTitle>Scanner le code du marchand</DialogTitle>
                          </DialogHeader>
                          <QRCodeScanner onScan={handleScannedCode}/>
                      </DialogContent>
                    </Dialog>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant total de l'achat (Fcfa)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ex: 150000" {...field} readOnly={!!prefillData} className={prefillData ? 'bg-muted' : ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="downPayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avance (Fcfa, optionnel)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ex: 30000" {...field} readOnly={!!prefillData} className={prefillData ? 'bg-muted' : ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="installmentsCount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre d'échéances</FormLabel>
                            <FormControl><Input type="number" {...field} readOnly={!!prefillData} className={prefillData ? 'bg-muted' : ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="repaymentFrequency"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Périodicité</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!prefillData}>
                                <FormControl><SelectTrigger className={prefillData ? 'bg-muted' : ''}><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                    <SelectItem value="bi-monthly">Bi-mensuel</SelectItem>
                                    <SelectItem value="monthly">Mensuel</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstInstallmentDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date 1ère échéance</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    disabled={!!prefillData}
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                        prefillData ? 'bg-muted' : ''
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP", { locale: fr })
                                    ) : (
                                        <span>Choisissez une date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                        date < new Date() || date > new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                                    }
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="marginRate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Taux de marge (% hebdo)</FormLabel>
                            <FormControl><Input type="number" {...field} readOnly className="bg-muted" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>


          <Button type="submit" className="w-full py-6" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Soumettre la demande
          </Button>
        </form>
      </Form>
    </div>
  );
}
