
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/hooks/use-user-management';
import { DialogClose } from './ui/dialog';
import { Loader2 } from 'lucide-react';

const pinChangeSchema = z.object({
  oldPin: z.string().regex(/^\d{4}$/, "L'ancien PIN doit être composé de 4 chiffres."),
  newPin: z.string().regex(/^\d{4}$/, "Le nouveau PIN doit être composé de 4 chiffres."),
  confirmPin: z.string().regex(/^\d{4}$/, "Le PIN de confirmation doit être composé de 4 chiffres."),
}).refine(data => data.newPin === data.confirmPin, {
    message: "Les nouveaux codes PIN ne correspondent pas.",
    path: ["confirmPin"],
});

type PinChangeFormValues = z.infer<typeof pinChangeSchema>;

type ChangePinFormProps = {
    alias: string;
};

export default function ChangePinForm({ alias }: ChangePinFormProps) {
    const { toast } = useToast();
    const { changeUserPin } = useUserManagement();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PinChangeFormValues>({
        resolver: zodResolver(pinChangeSchema),
        defaultValues: { oldPin: "", newPin: "", confirmPin: "" },
    });

    const onSubmit = (values: PinChangeFormValues) => {
        setIsLoading(true);
        const result = changeUserPin(alias, values.oldPin, values.newPin);

        if (result.success) {
            toast({
                title: "Code PIN mis à jour",
                description: "Votre code PIN a été modifié avec succès."
            });
            // We can't close the dialog from here, parent should handle it.
            // But we can reset the form.
            form.reset();
        } else {
            toast({
                title: "Erreur de modification",
                description: result.message,
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="oldPin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ancien Code PIN</FormLabel>
                            <FormControl><Input type="password" maxLength={4} placeholder="••••" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="newPin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nouveau Code PIN</FormLabel>
                            <FormControl><Input type="password" maxLength={4} placeholder="••••" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmer le nouveau Code PIN</FormLabel>
                            <FormControl><Input type="password" maxLength={4} placeholder="••••" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4 gap-2">
                     <DialogClose asChild>
                        <Button type="button" variant="ghost" disabled={isLoading}>Annuler</Button>
                     </DialogClose>
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Sauvegarder"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
