
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { TreasuryData, TreasuryOperation } from '@/hooks/use-treasury-management';
import { DialogFooter } from './ui/dialog';
import { DialogClose } from '@radix-ui/react-dialog';

const operationSchema = z.object({
  type: z.string().min(1, "Le type est requis."),
  amount: z.coerce.number().positive("Le montant doit être positif."),
  from: z.string().min(1, "Le compte source est requis."),
  to: z.string().min(1, "Le compte de destination est requis."),
  description: z.string().min(1, "Une description est requise."),
}).refine(data => data.from !== data.to, {
    message: "Les comptes source et destination doivent être différents.",
    path: ["to"],
});

type OperationFormValues = z.infer<typeof operationSchema>;

type TreasuryOperationFormProps = {
    treasuryData: TreasuryData;
    onAddOperation: (operation: Omit<TreasuryOperation, 'id' | 'date' | 'status'>) => void;
};

const snakeToTitle = (s: string) => s.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());


export default function TreasuryOperationForm({ treasuryData, onAddOperation }: TreasuryOperationFormProps) {
    
    const accountOptions = [
        "Fonds Propres",
        "Fonds Clients",
        ...Object.keys(treasuryData.assets).map(snakeToTitle)
    ];

    const form = useForm<OperationFormValues>({
        resolver: zodResolver(operationSchema),
        defaultValues: {
            type: "Virement",
            amount: undefined,
            from: "",
            to: "",
            description: "",
        },
    });

    const onSubmit = (values: OperationFormValues) => {
        onAddOperation(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                 <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Type d'opération</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Virement">Virement</SelectItem>
                                <SelectItem value="Dépôt">Dépôt</SelectItem>
                                <SelectItem value="Retrait">Retrait</SelectItem>
                                <SelectItem value="Règlement">Règlement</SelectItem>
                                <SelectItem value="Ajustement">Ajustement</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Montant</FormLabel>
                        <FormControl><Input type="number" placeholder="ex: 10000000" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                 <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="from" render={({ field }) => (
                        <FormItem>
                            <FormLabel>De</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Source..."/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {accountOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="to" render={({ field }) => (
                        <FormItem>
                            <FormLabel>À</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Destination..."/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {accountOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Décrivez l'objet de l'opération..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>


                <DialogFooter className="pt-4">
                    <DialogClose asChild>
                       <Button type="button" variant="ghost">Annuler</Button>
                    </DialogClose>
                     <Button type="submit" disabled={form.formState.isSubmitting}>
                        Exécuter l'opération
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
