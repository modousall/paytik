
"use client";

import { useUserManagement, type ManagedUser } from "@/hooks/use-user-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreHorizontal, UserX, UserCheck, Search, KeyRound } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { DialogClose } from "@radix-ui/react-dialog";

const ResetPinDialog = ({ user, onClose }: { user: ManagedUser, onClose: () => void }) => {
    const [newPin, setNewPin] = useState("");
    const { resetUserPin } = useUserManagement();
    const { toast } = useToast();
    
    const handleReset = () => {
        if(newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            toast({
                title: "Code PIN invalide",
                description: "Le code PIN doit contenir exactement 4 chiffres.",
                variant: "destructive"
            });
            return;
        }
        resetUserPin(user.alias, newPin);
        toast({
            title: "Code PIN réinitialisé",
            description: `Le code PIN pour ${user.name} a été mis à jour.`
        });
        onClose();
    }
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Réinitialiser le PIN de {user.name}</DialogTitle>
                <DialogDescription>
                    Entrez un nouveau code PIN à 4 chiffres pour cet utilisateur. L'utilisateur devra être informé de ce changement.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="new-pin">Nouveau Code PIN</Label>
                <Input
                    id="new-pin"
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength={4}
                    placeholder="••••"
                    className="text-center tracking-widest text-lg"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Annuler</Button>
                </DialogClose>
                <Button onClick={handleReset}>Réinitialiser</Button>
            </DialogFooter>
        </DialogContent>
    )
}


export default function AdminUserManagement() {
    const { users, toggleUserSuspension } = useUserManagement();
    const [searchTerm, setSearchTerm] = useState("");
    const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.alias.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePinResetClick = (user: ManagedUser) => {
        setSelectedUser(user);
        setIsPinDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setIsPinDialogOpen(false);
        setSelectedUser(null);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Gestion des Utilisateurs ({users.length})</CardTitle>
                            <CardDescription>Consultez la liste des utilisateurs et gérez leurs comptes.</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Rechercher par nom, email, alias..." 
                                className="pl-8 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Alias</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Solde Principal</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredUsers.map(user => (
                                <TableRow key={user.alias}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.alias}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'superadmin' ? 'destructive' : 'secondary'}>{user.role || 'user'}</Badge>
                                    </TableCell>
                                    <TableCell>{user.balance.toLocaleString()} Fcfa</TableCell>
                                    <TableCell>
                                        <Badge variant={user.isSuspended ? "destructive" : "default"} className={!user.isSuspended ? "bg-green-100 text-green-800" : ""}>
                                            {user.isSuspended ? "Suspendu" : "Actif"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={user.role === 'superadmin'}>
                                                <span className="sr-only">Ouvrir le menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => toggleUserSuspension(user.alias, !user.isSuspended)}>
                                                    {user.isSuspended ? <UserCheck className="mr-2 h-4 w-4" /> : <UserX className="mr-2 h-4 w-4" />}
                                                    <span>{user.isSuspended ? "Réactiver" : "Suspendre"}</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePinResetClick(user)}>
                                                    <KeyRound className="mr-2 h-4 w-4" />
                                                    <span>Réinitialiser PIN</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    {filteredUsers.length === 0 && (
                        <div className="text-center p-8">
                            <p>Aucun utilisateur ne correspond à votre recherche.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isPinDialogOpen} onOpenChange={handleDialogClose}>
                {selectedUser && <ResetPinDialog user={selectedUser} onClose={handleDialogClose} />}
            </Dialog>
        </>
    )
}
