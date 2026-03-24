import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, formatStr: string = "dd MMM yyyy") {
  try {
    return format(parseISO(dateStr), formatStr, { locale: it });
  } catch (e) {
    return dateStr;
  }
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}
