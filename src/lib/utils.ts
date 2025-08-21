import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value?: number | null): string => {
    if (value === null || value === undefined) {
        return `0 F`;
    }
    // Format with a locale that uses spaces, then replace spaces with dots.
    const formatted = new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value).replace(/\s/g, '.');
    return `${formatted} F`;
};
