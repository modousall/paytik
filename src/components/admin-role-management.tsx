
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { ShieldCheck, UserCog, Building, User, Headset, PlusCircle, Trash2, Edit, UserSearch, Scale, Briefcase, UserSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useRoleManagement } from '@/hooks/use-role-management';
import type { Role } from '@/hooks/use-role-management';

const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Le nom est requis."),
  description: z.string().min(1, "La description est requise."),
  permissions: z.string().min(1, "Au moins une permission est requise."),
});
type RoleFormValues = z.infer<typeof roleSchema>;

const roleIcons: Record<string, JSX.Element> = {
    "Super Admin": <ShieldCheck className="h-8 w-8 text-destructive" />,
    "Admin": <UserCog className="h-8 w-8 text-primary" />,
    "Support": <Headset className="h-8 w-8 text-primary" />,
    "Marchand": <Building className="h-8 w-8 text-primary" />,
    "Utilisateur": <User className="h-8 w-8 text-primary" />,
    "Agent de Crédit": <UserSearch className="h-8 w-8 text-primary" />,
    "Agent de Conformité": <Scale className="h-8 w-8 text-primary" />,
    "Guichetier": <UserSquare className="h-8 w-8 text-primary" />,
    "Responsable Agence": <Briefcase className="h-8 w-8 text-primary" />,
};

const RoleDialog = ({ 
    role, 
    onSave,
    onClose
}: { 
    role: Partial<Role> | null;
    onSave: (data: Role) => void;
    onClose: () => void;
}) => {
    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            id: role?.id,
            name: role?.name || "",
            description: role?.description || "",
            permissions: role?.permissions?.join(', ') || "",
        },
    });

    const onSubmit = (values: RoleFormValues) => {
        onSave({
            id: values.id || `role_${Date.now()}`,
            name: values.name,
            description: values.description,
            permissions: values.permissions.split(',').map(p => p.trim()),
            isDeletable: role?.isDeletable === undefined ? true : role.isDeletable,
        });
        onClose();
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{role?.id ? "Modifier le rôle" : "Créer un nouveau rôle"}</DialogTitle>
                <DialogDescription>
                    Définissez le nom, la description et les permissions associées à ce rôle.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField name="name" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom du Rôle</FormLabel>
                            <FormControl><Input placeholder="ex: Analyste Financier" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="description" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea placeholder="Décrivez les responsabilités de ce rôle." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="permissions" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Permissions</FormLabel>
                            <FormControl><Textarea placeholder="Séparez les permissions par des virgules. ex: voir_dashboard, exporter_rapports" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
                        <Button type="submit">{role?.id ? "Sauvegarder" : "Créer le rôle"}</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};


export default function AdminRoleManagement() {
    const { roles, addRole, updateRole, removeRole } = useRoleManagement();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);

    const openDialog = (role: Partial<Role> | null = null) => {
        setEditingRole(role);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setEditingRole(null);
        setIsDialogOpen(false);
    };

    const handleSave = (data: Role) => {
        if (roles.some(r => r.id === data.id)) {
            updateRole(data.id, data);
        } else {
            addRole(data);
        }
    };

  return (
    <div>
        <CardHeader className="px-0 flex-row justify-between items-start">
            <div>
                <CardTitle>Gestion des Rôles et Permissions</CardTitle>
                <CardDescription>
                    Configurez les rôles et les permissions pour contrôler les accès à la plateforme.
                </CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
                <PlusCircle /> Créer un rôle
            </Button>
        </CardHeader>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
                <Card key={role.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            {roleIcons[role.name] || <UserCog className="h-8 w-8 text-primary" />}
                            <CardTitle className="text-xl">{role.name}</CardTitle>
                        </div>
                        <CardDescription className="pt-2 h-12">{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <h4 className="font-semibold mb-2 text-sm">Permissions clés :</h4>
                        <div className="flex flex-wrap gap-2">
                            {role.permissions.map(p => (
                                <span key={p} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                        <div className="flex w-full justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openDialog(role)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeRole(role.id)} disabled={!role.isDeletable}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {<RoleDialog role={editingRole} onSave={handleSave} onClose={closeDialog} />}
        </Dialog>
    </div>
  );
}
