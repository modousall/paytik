
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Info, CheckCircle, XCircle, Hourglass, CalendarIcon, Banknote, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import QRCodeScanner from './qr-code-scanner';
import { useBnpl } from '@/hooks/use-bnpl';
import { useIslamicFinancing } from '@/hooks/use-islamic-financing';
import type { BnplAssessmentOutput, IslamicFinancingOutput } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';

// --- Zod Schemas ---
const financingTypeSchema = z.enum(['bnpl', 'mourabaha', 'ijara', 'moudaraba']);

const baseSchema = z.object({
  financingType: financingTypeSchema,
});

const bnplSchema = baseSchema.extend({
  financingType: z.literal('bnpl'),
  merchantAlias: z.string().min(1, "L'alias du marchand est requis."),
  amount: z.coerce.number().positive("Le montant doit être positif."),
  downPayment: z.coerce.number().min(0).optional(),
  repaymentFrequency: z.enum(['daily', 'weekly', 'monthly']),
  installmentsCount: z.coerce.number().int().positive(),
  firstInstallmentDate: z.date(),
});

const islamicFinancingSchema = baseSchema.extend({
  financingType: z.enum(['mourabaha', 'ijara', 'moudaraba']),
  amount: z.coerce.number().positive("Le montant doit être positif."),
  durationMonths: z.coerce.number().int().min(1).max(36),
  purpose: z.string().min(10, "Veuillez décrire l'objet.").max(200),
});

const unifiedSchema = z.discriminatedUnion("financingType", [bnplSchema, islamicFinancingSchema]);

type UnifiedFormValues = z.infer<typeof unifiedSchema>;
type FinancingType = UnifiedFormValues['financingType'];

// --- Props ---
export type CreditProposalPrefill = Omit<Extract<UnifiedFormValues, { financingType: 'bnpl' }>, 'firstInstallmentDate' | 'financingType'> & {
    firstInstallmentDate: string;
};

type UnifiedFinancingFormProps = {
  onBack: () => void;
  prefillData?: CreditProposalPrefill | null;
};

// --- Constants & Helpers ---
const ANNUAL_RATE = 23.5;
const getMarginRate = (frequency: 'daily' | 'weekly' | 'monthly') => {
  switch (frequency) {
    case 'daily': return ANNUAL_RATE / 365;
    case 'weekly': return ANNUAL_RATE / 52;
    case 'monthly': return ANNUAL_RATE / 12;
    default: return 0;
  }
};

const financingTypeLabels: Record<FinancingType, string> = {
  bnpl: 'Crédit Achat (BNPL)',
  mourabaha: 'Mourabaha (Achat de biens)',
  ijara: 'Ijara (Location)',
  moudaraba: 'Moudaraba (Partenariat)',
};

// --- Result Display Component ---
const ResultDisplay = ({ result, onBack }: { result: BnplAssessmentOutput | IslamicFinancingOutput, onBack: () => void }) => {
    const statusConfig = {
        approved: { icon: <CheckCircle className="h-12 w-12 text-green-500" />, title: "Demande Approuvée !", alertVariant: "default" as "default", desc: "Votre demande a été approuvée." },
        rejected: { icon: <XCircle className="h-12 w-12 text-destructive" />, title: "Demande Rejetée", alertVariant: "destructive" as "destructive", desc: "Nous ne pouvons pas approuver votre demande pour le moment." },
        review: { icon: <Hourglass className="h-12 w-12 text-blue-500" />, title: "Demande en Cours d'Examen", alertVariant: "default" as "default", desc: "Votre demande nécessite un examen manuel." }
    };
    const config = statusConfig[result.status];

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
            {config.icon}
            <h2 className="text-2xl font-bold">{config.title}</h2>
            <Alert variant={config.alertVariant}>
                <AlertTitle className="font-semibold">Raison: {result.reason}</AlertTitle>
                <AlertDescription>{config.desc}</AlertDescription>
            </Alert>
            {result.status === 'approved' && result.repaymentPlan && (
                <div className="w-full p-4 border rounded-lg bg-secondary">
                    <h3 className="font-semibold mb-2">Plan de remboursement</h3>
                    <p className="text-sm">{result.repaymentPlan}</p>
                </div>
            )}
            <Button onClick={onBack} variant="outline">Retour</Button>
        </div>
    );
}

// --- Confirmation Dialog Component ---
const ConfirmationDialog = ({ values, onConfirm, onCancel }: { values: any | null, onConfirm: () => void, onCancel: () => void }) => {
    if (!values) return null;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirmer la demande de crédit</DialogTitle>
                 <AlertDescription>
                    Veuillez vérifier les détails de votre demande avant de la soumettre pour évaluation.
                 </AlertDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 text-sm border-t border-b">
                 <div className="flex justify-between items-center"><span className="text-muted-foreground">Marchand</span><span className="font-medium">{values.merchantAlias}</span></div>
                 <div className="flex justify-between items-center"><span className="text-muted-foreground">Montant de l'achat</span><span className="font-medium">{formatCurrency(values.amount || 0)}</span></div>
                 <div className="flex justify-between items-center"><span className="text-muted-foreground">Avance versée</span><span className="font-medium">{formatCurrency(values.downPayment || 0)}</span></div>
                 <div className="flex justify-between items-center font-semibold"><span className="text-muted-foreground">Montant à financer par Midi</span><span className="font-medium">{formatCurrency(values.financedAmount || 0)}</span></div>
                 <hr/>
                 <div className="flex justify-between items-center text-base"><span className="text-muted-foreground">Montant par échéance</span><span className="font-bold text-primary">{formatCurrency(values.installmentAmount || 0)}</span></div>
                 <div className="flex justify-between items-center"><span className="text-muted-foreground">Nombre d'échéances</span><span className="font-medium">{values.installmentsCount}</span></div>
                 <div className="flex justify-between items-center"><span className="text-muted-foreground">Coût total estimé du crédit</span><span className="font-medium">{formatCurrency(values.totalCost || 0)}</span></div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Annuler</Button>
                <Button onClick={onConfirm}>Confirmer et Soumettre</Button>
            </DialogFooter>
        </DialogContent>
    )
}

// --- Main Form Component ---
export default function UnifiedFinancingForm({ onBack, prefillData = null }: UnifiedFinancingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<BnplAssessmentOutput | IslamicFinancingOutput | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formValuesForConfirmation, setFormValuesForConfirmation] = useState<any>(null);
  const { toast } = useToast();
  const bnpl = useBnpl();
  const islamicFinancing = useIslamicFinancing();

  const form = useForm<UnifiedFormValues>({
    resolver: zodResolver(unifiedSchema),
    defaultValues: prefillData ? { 
        financingType: 'bnpl', 
        ...prefillData, 
        firstInstallmentDate: new Date(prefillData.firstInstallmentDate) 
    } : {
        financingType: 'bnpl',
        merchantAlias: '',
        amount: '' as any,
        downPayment: '' as any,
        repaymentFrequency: "weekly",
        installmentsCount: 17,
        firstInstallmentDate: undefined,
    },
  });
  
  const watchedType = form.watch('financingType');

  // Dynamic calculation for BNPL
  const watchedBnplValues = form.watch(['amount', 'downPayment', 'installmentsCount', 'repaymentFrequency']);
  const marginRate = getMarginRate(watchedBnplValues[3] as 'daily'|'weekly'|'monthly');

  const calculatedBnplValues = useMemo(() => {
    const [amount, downPayment, installmentsCount] = watchedBnplValues;
    if (watchedType === 'bnpl' && amount > 0 && installmentsCount > 0 && marginRate >= 0) {
        const financedAmount = amount - (downPayment || 0);
        const periodicRate = marginRate / 100;
        const installmentAmount = periodicRate > 0 
            ? (financedAmount * periodicRate) / (1 - Math.pow(1 + periodicRate, -installmentsCount))
            : financedAmount / installmentsCount;
        const totalRepaid = installmentAmount * installmentsCount;
        const totalCost = totalRepaid - financedAmount;
        return { financedAmount, installmentAmount: isNaN(installmentAmount) ? 0 : installmentAmount, totalCost: isNaN(totalCost) ? 0 : totalCost };
    }
    return { financedAmount: 0, installmentAmount: 0, totalCost: 0};
  }, [watchedType, watchedBnplValues, marginRate]);


  useEffect(() => {
    if (prefillData) {
        form.reset({
            financingType: 'bnpl',
            ...prefillData,
            firstInstallmentDate: new Date(prefillData.firstInstallmentDate),
        });
        toast({ title: "Proposition de crédit chargée", description: "Vérifiez et soumettez la demande." });
    }
  }, [prefillData, form, toast]);

  const onSubmit = async (values: UnifiedFormValues) => {
    if (values.financingType === 'bnpl') {
        setFormValuesForConfirmation({ ...values, ...calculatedBnplValues });
        setShowConfirmation(true);
    } else {
        // For Islamic financing, submit directly
        setIsLoading(true);
        try {
            const result = await islamicFinancing.submitRequest({
                financingType: values.financingType,
                amount: values.amount,
                durationMonths: values.durationMonths,
                purpose: values.purpose,
            });
            setAssessmentResult(result);
        } catch(e) {
            console.error(e);
            toast({ title: "Erreur de soumission", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }
  };

  const onConfirmBnplSubmit = async () => {
    if (!formValuesForConfirmation) return;
    setShowConfirmation(false);
    setIsLoading(true);
    try {
        const result = await bnpl.submitRequest({
            merchantAlias: formValuesForConfirmation.merchantAlias,
            amount: formValuesForConfirmation.amount,
            downPayment: formValuesForConfirmation.downPayment,
            installmentsCount: formValuesForConfirmation.installmentsCount,
            marginRate: marginRate,
            repaymentFrequency: formValuesForConfirmation.repaymentFrequency,
            firstInstallmentDate: formValuesForConfirmation.firstInstallmentDate.toISOString(),
        });
        setAssessmentResult(result);
    } catch(e) {
        console.error(e);
        toast({ title: "Erreur de soumission", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setFormValuesForConfirmation(null);
    }
  }
  
  const handleScannedCode = (decodedText: string) => {
    form.setValue('merchantAlias', decodedText, { shouldValidate: true });
    setIsScannerOpen(false);
  }
  
  const handleResetAndBack = () => {
      setAssessmentResult(null);
      form.reset();
      onBack();
  }

  if(assessmentResult) {
    return <ResultDisplay result={assessmentResult} onBack={handleResetAndBack} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="financingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de Financement</FormLabel>
              <Select onValueChange={(value) => field.onChange(value as FinancingType)} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez un type..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(financingTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {watchedType === 'bnpl' && (
            <>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Comment ça marche ?</AlertTitle>
                    <AlertDescription>
                    Ce service de crédit vous est offert par Midi pour votre achat chez un partenaire.
                    </AlertDescription>
                </Alert>
                <FormField control={form.control} name="merchantAlias" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Alias ou Code Marchand</FormLabel>
                        <FormControl>
                        <div className="flex gap-2">
                            <Input placeholder="Entrez l'identifiant du marchand" {...field} readOnly={!!prefillData} className={prefillData ? 'bg-muted' : ''} />
                            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" aria-label="Scanner" disabled={!!prefillData}><QrCode /></Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md p-0">
                                    <QRCodeScanner onScan={handleScannedCode}/>
                                </DialogContent>
                            </Dialog>
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Montant total de l'achat</FormLabel>
                        <FormControl><Input type="number" {...field} readOnly={!!prefillData} className={prefillData ? 'bg-muted' : ''}/></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="downPayment" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Avance (optionnel)</FormLabel>
                        <FormControl><Input type="number" {...field} readOnly={!!prefillData} className={prefillData ? 'bg-muted' : ''}/></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="installmentsCount" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre d'échéances</FormLabel>
                            <FormControl><Input type="number" {...field} readOnly={!!prefillData} className={prefillData ? 'bg-muted' : ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="repaymentFrequency" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Périodicité</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!prefillData}>
                                <FormControl><SelectTrigger className={prefillData ? 'bg-muted' : ''}><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="daily">Journalier</SelectItem>
                                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                    <SelectItem value="monthly">Mensuel</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="firstInstallmentDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date 1ère échéance</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} disabled={!!prefillData} className={cn(!field.value && "text-muted-foreground", prefillData ? 'bg-muted' : '')}>
                                {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()}/>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}/>
                {calculatedBnplValues.installmentAmount > 0 && (
                    <Card className="bg-secondary/50">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Montant par échéance (estimation)</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(calculatedBnplValues.installmentAmount)}</p>
                            </div>
                            <Banknote className="h-8 w-8 text-primary/70" />
                        </CardContent>
                    </Card>
                )}
            </>
        )}

        { (watchedType === 'mourabaha' || watchedType === 'ijara' || watchedType === 'moudaraba') && (
            <>
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Comment ça marche?</AlertTitle>
                    <AlertDescription>
                        Soumettez votre besoin. La plateforme Midi évalue votre demande et si elle est approuvée, les fonds sont immédiatement disponibles sur votre compte.
                    </AlertDescription>
                </Alert>
                <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Montant du financement (F)</FormLabel>
                        <FormControl><Input type="number" placeholder="ex: 250000" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="durationMonths" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Durée de remboursement (en mois)</FormLabel>
                        <FormControl><Input type="number" placeholder="ex: 12" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="purpose" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Objet du financement</FormLabel>
                        <FormControl><Textarea placeholder="ex: Achat d'un ordinateur portable" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </>
        )}

        <Button type="submit" className="w-full py-6" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Vérifier ma demande
        </Button>

        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
           <ConfirmationDialog 
                values={formValuesForConfirmation}
                onConfirm={onConfirmBnplSubmit}
                onCancel={() => setShowConfirmation(false)}
            />
        </Dialog>
      </form>
    </Form>
  );
}
