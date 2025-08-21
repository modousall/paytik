
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Info, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useIslamicFinancing } from '@/hooks/use-islamic-financing';
import type { IslamicFinancingOutput } from '@/lib/types';

const financingFormSchema = z.object({
  financingType: z.string().min(1, { message: "Le type de financement est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant doit être positif." }),
  durationMonths: z.coerce.number().int().min(1, "La durée doit être d'au moins 1 mois.").max(36, "La durée ne peut excéder 36 mois."),
  purpose: z.string().min(10, "Veuillez décrire l'objet de votre financement en quelques mots.").max(200),
});

type FinancingFormValues = z.infer<typeof financingFormSchema>;

type IslamicFinancingProps = {
  onBack: () => void;
};

const ResultDisplay = ({ result, onBack }: { result: IslamicFinancingOutput, onBack: () => void }) => {
    const statusConfig = {
        approved: {
            icon: <CheckCircle className="h-12 w-12 text-green-500" />,
            title: "Demande Approuvée !",
            alertVariant: "default" as "default",
            description: "Votre demande de financement a été approuvée. Les fonds ont été crédités sur votre compte.",
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
            description: "Votre demande nécessite un examen manuel. Vous recevrez une notification une fois qu'une décision aura été prise.",
        }
    }
    
    const config = statusConfig[result.status];

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
            {config.icon}
            <h2 className="text-2xl font-bold">{config.title}</h2>
            <Alert variant={config.alertVariant}>
                <AlertTitle className="font-semibold">Raison: {result.reason}</AlertTitle>
                <AlertDescription>{config.description}</AlertDescription>
            </Alert>
            
            {result.status === 'approved' && result.repaymentPlan && (
                <div className="w-full p-4 border rounded-lg bg-secondary">
                    <h3 className="font-semibold mb-2">Plan de remboursement</h3>
                    <p className="text-sm">{result.repaymentPlan}</p>
                </div>
            )}

            <Button onClick={onBack} variant="outline">Retour</Button>
        </div>
    )
}

export default function IslamicFinancing({ onBack }: IslamicFinancingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<IslamicFinancingOutput | null>(null);
  const { toast } = useToast();
  const { submitRequest } = useIslamicFinancing();

  const form = useForm<FinancingFormValues>({
    resolver: zodResolver(financingFormSchema),
    defaultValues: {
      financingType: "Mourabaha",
      amount: '' as any,
      durationMonths: 12,
      purpose: "",
    },
  });

  const onSubmit = async (values: FinancingFormValues) => {
    setIsLoading(true);
    try {
        const result = await submitRequest(values);
        setAssessmentResult(result);
    } catch(e) {
        console.error(e);
        toast({
            title: "Erreur de soumission",
            description: "Une erreur est survenue lors de l'évaluation. Veuillez réessayer.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleReset = () => {
      setAssessmentResult(null);
      form.reset();
  }

  if (assessmentResult) {
      return <ResultDisplay result={assessmentResult} onBack={handleReset} />;
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Comment ça marche ?</AlertTitle>
            <AlertDescription>
              Soumettez votre besoin. La plateforme Midi évalue votre demande et si elle est approuvée, les fonds sont immédiatement disponibles sur votre compte.
            </AlertDescription>
          </Alert>
          
          <FormField
            control={form.control}
            name="financingType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Type de Financement</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type de financement" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Mourabaha">Mourabaha (Achat de biens)</SelectItem>
                        <SelectItem value="Ijara">Ijara (Location)</SelectItem>
                        <SelectItem value="Moudaraba">Moudaraba (Partenariat)</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
           />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant du financement (F)</FormLabel>
                <FormControl><Input type="number" placeholder="ex: 250000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée de remboursement (en mois)</FormLabel>
                <FormControl><Input type="number" placeholder="ex: 12" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objet du financement</FormLabel>
                <FormControl><Textarea placeholder="ex: Achat d'un ordinateur portable pour mon travail" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full py-6" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Soumettre ma demande pour évaluation
          </Button>
        </form>
      </Form>
    </div>
  );
}
