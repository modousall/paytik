
"use client";

import * as React from "react"
import { Building, Check, ChevronsUpDown, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUserManagement } from "@/hooks/use-user-management"
import { useContacts } from "@/hooks/use-contacts";

type AliasSelectorProps = {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    filter?: 'merchant' | 'user' | 'all'
}

export function AliasSelector({ value, onChange, disabled = false, filter = 'all' }: AliasSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const { users } = useUserManagement();
  const { contacts } = useContacts();

  const suggestions = React.useMemo(() => {
    const contactSuggestions = contacts.map(c => ({
        value: c.alias,
        label: `${c.name} (Contact)`,
        type: 'contact'
    }));

    const userSuggestions = users
        .filter(u => {
            if (filter === 'merchant') return u.role === 'merchant';
            if (filter === 'user') return u.role === 'user';
            return true;
        })
        .map(u => ({
            value: u.alias,
            label: `${u.name} (${u.role})`,
            type: u.role === 'merchant' ? 'merchant' : 'user'
        }));
    
    // Simple deduplication based on alias value
    const allSuggestions = [...contactSuggestions, ...userSuggestions];
    const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) =>
        index === self.findIndex((s) => s.value === suggestion.value)
    );

    return uniqueSuggestions;

  }, [users, contacts, filter]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value
            ? suggestions.find((s) => s.value === value)?.label || value
            : "Sélectionnez ou saisissez..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder="Rechercher par nom ou alias..." 
            onValueChange={(search) => {
                if (!suggestions.some(s => s.value === search || s.label === search)) {
                    onChange(search);
                }
            }}
          />
          <CommandList>
            <CommandEmpty>Aucun résultat.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion.value}
                  value={suggestion.label}
                  onSelect={() => {
                    onChange(suggestion.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === suggestion.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                   {suggestion.type === 'merchant' ? <Building className="mr-2 h-4 w-4 text-muted-foreground"/> : <User className="mr-2 h-4 w-4 text-muted-foreground"/>}
                  {suggestion.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
