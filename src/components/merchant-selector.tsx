
"use client";

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

type MerchantSelectorProps = {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function MerchantSelector({ value, onChange, disabled = false }: MerchantSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const { users } = useUserManagement();

  const merchants = React.useMemo(() => {
      return users
        .filter(u => u.role === 'merchant')
        .map(m => ({ value: m.alias, label: `${m.name} (${m.alias})` }));
  }, [users]);
  
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
            ? merchants.find((merchant) => merchant.value === value)?.label
            : "Sélectionnez un marchand..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un marchand..." />
          <CommandList>
            <CommandEmpty>Aucun marchand trouvé.</CommandEmpty>
            <CommandGroup>
              {merchants.map((merchant) => (
                <CommandItem
                  key={merchant.value}
                  value={merchant.label}
                  onSelect={() => {
                    onChange(merchant.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === merchant.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {merchant.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
