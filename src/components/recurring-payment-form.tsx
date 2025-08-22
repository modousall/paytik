

"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { DialogFooter, DialogClose } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRecurringPayments } from '@/hooks/use-recurring-payments';
import type { RecurringPayment } from '@/hooks/use-recurring-payments';
import { AliasSelector } from './alias-selector';


const recurringPaymentSchema = z.object({
  recipientAlias: z.string().min(1, { message: "Le destinataire est requis." }),
  amount: z.coerce.number().positive({ message: "Le montant doit être positif." }),
  frequency: z.enum(['daily', 'weekly', 'monthly'], { required_error: "La fréquence est requise." }),
  startDate: z.date({ required_error: "La date de début est requise." }),
  endDate: z.date().optional(),
  reason: z.string().min(1, "La raison est requise."),
}).refine(data => !data.endDate || data.endDate > data.startDate, {
    message: "La date de fin doit être après la date de début.",
    path: ["endDate"],
});

type RecurringPaymentFormValues = z.infer<typeof recurringPaymentSchema>;

type RecurringPaymentFormProps = {
    onPaymentCreated: () => void;
};

export default function RecurringPaymentForm({ onPaymentCreated }: RecurringPaymentFormProps) {
    const { addRecurringPayment } = useRecurringPayments();
    const { toast } = useToast();

    const form = useForm<RecurringPaymentFormValues>({
        resolver: zodResolver(recurringPaymentSchema),
        defaultValues: {
            recipientAlias: "",
            amount: '' as any,
            frequency: 'monthly',
            startDate: new Date(),
            reason: "",
        },
    });

    const onSubmit = (values: RecurringPaymentFormValues) => {
        const newPayment: Omit<RecurringPayment, 'id'> = {
            ...values,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate?.toISOString(),
        }
        addRecurringPayment(newPayment);
        toast({ title: "Paiement programmé !", description: `Un paiement récurrent a été configuré pour ${values.recipientAlias}.`})
        onPaymentCreated();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                 <FormField
                    control={form.control}
                    name="recipientAlias"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Destinataire</FormLabel>
                            <FormControl>
                                <AliasSelector value={field.value} onChange={field.onChange} />
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
                            <FormLabel>Montant par échéance</FormLabel>
                            <FormControl><Input type="number" placeholder="ex: 25000" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Raison du paiement</FormLabel>
                            <FormControl><Input placeholder="ex: Loyer, Abonnement" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fréquence</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="daily">Journalier</SelectItem>
                                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                    <SelectItem value="monthly">Mensuel</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date de début</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date de fin (optionnel)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Jamais</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <DialogFooter className="pt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="ghost">Annuler</Button>
                    </DialogClose>
                    <Button type="submit">Programmer le Paiement</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
