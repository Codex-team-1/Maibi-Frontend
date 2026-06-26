/**
 * Minimal className combiner — joins truthy class fragments with a space.
 * Keeps the dependency surface to exactly the requested stack (no clsx).
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
