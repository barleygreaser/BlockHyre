import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from "@supabase/supabase-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserDisplayName(user: User | null, profileName?: string | null): string {
  if (profileName) return profileName;
  if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
  if (user?.email) return user.email.split('@')[0]; // Fallback to email username
  return "Maker";
}

export function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '')       // Trim - from end of text
}
