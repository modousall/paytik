
"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCms, type CmsContent } from '@/hooks/use-cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const cmsSchema = z.object({
    hero: z.object({
        title: z.string().min(1, "Le titre est requis."),
        subtitle: z.string().min(1, "Le sous-titre est requis."),
        description: z.string().min(1, "La description est requise."),
    }),
    features: z.array(z.object({
        id: z.string(),
        href: z.string(),
        title: z.string().min(1, "Le titre de la carte est requis."),
        description: z.string().min(1, "La description de la carte est requise."),
    })),
});

export default function AdminCms() {
    const { content, setContent } = useCms();

    const form = useForm<CmsContent>({
        resolver: zodResolver(cmsSchema),
        values: content, // Use `values` to keep the form in sync with external changes
        resetOptions: {
            keepDirtyValues: true,
        }
    });
    
    const { fields } = useFieldArray({
        control: form.control,
        name: "features",
    });

    const onSubmit = (data: CmsContent) => {
        setContent(data);
        toast({
            title: "Contenu mis à jour",
            description: "Les modifications de la page d'accueil ont été enregistrées avec succès.",
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Section Héro</CardTitle>
                        <CardDescription>Modifiez le contenu principal de la page d'accueil.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="hero.title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Titre Principal</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hero.subtitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sous-titre</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hero.description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cartes de Fonctionnalités</CardTitle>
                        <CardDescription>Gérez le contenu des quatre cartes de fonctionnalités.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-4 p-4 border rounded-md">
                                <h4 className="font-semibold text-lg capitalize">{field.id}</h4>
                                <FormField
                                    control={form.control}
                                    name={`features.${index}.title`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Titre de la Carte</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`features.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description de la Carte</FormLabel>
                                            <FormControl><Textarea {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <div className="flex justify-end">
                    <Button type="submit">Enregistrer les modifications</Button>
                </div>
            </form>
        </Form>
    );
}
