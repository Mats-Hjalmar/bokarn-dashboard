import { CalendarDays, MapPinned, Tags, type LucideIcon } from 'lucide-react'

/**
 * Permission keys the dashboard gates its sections on. These mirror the
 * constants in backend/internal/httpx/security.go and the rows in the
 * permissions table — all three lists must move together.
 *
 * A section without a permission is visible to any member of the operator,
 * which is what makes a role with no permissions a read-only role.
 */
export const PERM = {
  settings: 'settings.manage',
  inventory: 'inventory.manage',
  pricing: 'pricing.manage',
  bookings: 'bookings.manage',
  frontdesk: 'frontdesk.operate',
  billing: 'billing.manage',
  loyalty: 'loyalty.manage',
  guests: 'guests.read_registration',
  audit: 'audit.read',
} as const

export type NavSection = {
  href: string
  label: string
  icon: LucideIcon
  /** Omitted means every member of the operator sees it. */
  permission?: string
}

/** The sidebar, in order. Grows as milestones land. */
export const sections: readonly NavSection[] = [
  { href: '/kalender', label: 'Kalender', icon: CalendarDays },
  { href: '/platser', label: 'Platser', icon: MapPinned },
  { href: '/priser', label: 'Priser', icon: Tags },
]

export function visibleSections(permissions: string[]): NavSection[] {
  const held = new Set(permissions)
  return sections.filter((s) => !s.permission || held.has(s.permission))
}
