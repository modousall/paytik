import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value?: number | null): string => {
    if (value === null || value === undefined) {
        return `0 F`;
    }
    // Format to a string with no fractional digits, then use regex to insert dots.
    const numString = Math.round(value).toString();
    const formatted = numString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formatted} F`;
};
