import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value?: number | null): string => {
    if (value === null || value === undefined) {
        return `0 F`;
    }
    const formatted = value.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return `${formatted.replace(/,/g, '.')} F`;
};
