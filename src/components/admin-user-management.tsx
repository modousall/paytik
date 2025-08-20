
"use client";

import { useUserManagement, type ManagedUser } from "@/hooks/use-user-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreHorizontal, UserX, UserCheck, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";

export default function AdminUserManagement() {
    const { users, toggleUserSuspension } = useUserManagement();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.alias.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
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
                                <TableCell>{user.balance.toLocaleString()} Fcfa</TableCell>
                                <TableCell>
                                    <Badge variant={user.isSuspended ? "destructive" : "default"} className={!user.isSuspended ? "bg-green-100 text-green-800" : ""}>
                                        {user.isSuspended ? "Suspendu" : "Actif"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
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
    )
}
