
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, UserPlus, ArrowDown, Info } from "lucide-react";
import { Badge } from "./ui/badge";

type Notification = {
  id: string;
  type: "new_contact" | "payment_received" | "system_update";
  title: string;
  description: string;
  date: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "payment_received",
    title: "Paiement reçu",
    description: "Maman vous a envoyé 25 000 Fcfa.",
    date: "Il y a 5 minutes",
    read: false,
  },
  {
    id: "2",
    type: "new_contact",
    title: "Nouveau contact ajouté",
    description: "Papa a été ajouté à votre liste de contacts.",
    date: "Il y a 2 heures",
    read: false,
  },
  {
    id: "3",
    type: "system_update",
    title: "Mise à jour système",
    description: "Le paiement des factures SENELEC est désormais plus rapide.",
    date: "Hier",
    read: true,
  },
];

const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  switch (type) {
    case "new_contact":
      return (
        <div className="p-2 bg-blue-100 rounded-full">
          <UserPlus className="h-5 w-5 text-blue-600" />
        </div>
      );
    case "payment_received":
      return (
        <div className="p-2 bg-green-100 rounded-full">
          <ArrowDown className="h-5 w-5 text-green-600" />
        </div>
      );
    case "system_update":
      return (
        <div className="p-2 bg-gray-100 rounded-full">
          <Info className="h-5 w-5 text-gray-600" />
        </div>
      );
  }
};

export default function Notifications() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {mockNotifications.map((notification) => (
            <div key={notification.id} className="flex gap-3 items-start">
              <NotificationIcon type={notification.type} />
              <div className="flex-grow">
                <p className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  {notification.date}
                </p>
              </div>
              {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
