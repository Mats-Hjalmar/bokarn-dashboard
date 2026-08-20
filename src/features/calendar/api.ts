import { apiFetch } from '@/lib/api/client'
import type { CalendarRow } from '@/features/inventory'

export function fetchCalendar(
  from: string,
  to: string,
): Promise<CalendarRow[]> {
  return apiFetch<CalendarRow[]>(`/admin/calendar?from=${from}&to=${to}`, {
    cache: 'no-store',
  })
}
