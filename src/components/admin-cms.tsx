
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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
    images: z.object({
        financing: z.string().url("L'URL de l'image de financement est invalide."),
        savings: z.string().url("L'URL de l'image d'épargne est invalide."),
        payments: z.string().url("L'URL de l'image de paiements est invalide."),
        security: z.string().url("L'URL de l'image de sécurité est invalide."),
    }),
});

export default function AdminCms() {
    const { content, setContent } = useCms();

    const form = useForm<CmsContent>({
        resolver: zodResolver(cmsSchema),
        values: content,
        resetOptions: {
            keepDirtyValues: true,
        }
    });
    
    const { fields: featureFields } = useFieldArray({
        control: form.control,
        name: "features",
    });

    const onSubmit = (data: CmsContent) => {
        setContent(data);
        toast({
            title: "Contenu mis à jour",
            description: "Les modifications de la page d'accueil ont été enregistrées.",
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Gestion du Contenu de la Landing Page</CardTitle>
                        <CardDescription>Modifiez les textes et les images affichés sur la page d'accueil et les pages de détails.</CardDescription>
                    </CardHeader>
                </Card>
                <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text">Contenus Textuels</TabsTrigger>
                        <TabsTrigger value="images">Images des Pages</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Section Héro</CardTitle>
                                <CardDescription>Le contenu principal en haut de la page d'accueil.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="hero.title" render={({ field }) => (
                                    <FormItem><FormLabel>Titre Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="hero.subtitle" render={({ field }) => (
                                    <FormItem><FormLabel>Sous-titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="hero.description" render={({ field }) => (
                                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cartes de Fonctionnalités</CardTitle>
                                <CardDescription>Les quatre cartes de fonctionnalités sur la page d'accueil.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {featureFields.map((field, index) => (
                                    <div key={field.id} className="space-y-4 p-4 border rounded-md">
                                        <h4 className="font-semibold text-lg capitalize">{field.id}</h4>
                                        <FormField control={form.control} name={`features.${index}.title`} render={({ field }) => (
                                            <FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`features.${index}.description`} render={({ field }) => (
                                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="images" className="mt-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Images des Pages de Détails</CardTitle>
                                <CardDescription>Changez les images d'illustration pour chaque page de fonctionnalité.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="images.financing" render={({ field }) => (
                                    <FormItem><FormLabel>Page Financement</FormLabel><FormControl><Input placeholder="URL de l'image" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="images.savings" render={({ field }) => (
                                    <FormItem><FormLabel>Page Épargne</FormLabel><FormControl><Input placeholder="URL de l'image" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="images.payments" render={({ field }) => (
                                    <FormItem><FormLabel>Page Paiements</FormLabel><FormControl><Input placeholder="URL de l'image" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="images.security" render={({ field }) => (
                                    <FormItem><FormLabel>Page Sécurité</FormLabel><FormControl><Input placeholder="URL de l'image" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                
                <div className="flex justify-end">
                    <Button type="submit">Enregistrer les modifications</Button>
                </div>
            </form>
        </Form>
    );
}
