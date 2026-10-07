/**
 * Shortens a full name to "F. Last" (e.g. "Shubham Bawankar" -> "S. Bawankar").
 * Middle names are dropped; single-word names are returned unchanged.
 */
export const formatShortName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return parts[0] ?? ''
  const first = parts[0]
  const last = parts[parts.length - 1]
  return `${first.charAt(0).toUpperCase()}. ${last}`
}
