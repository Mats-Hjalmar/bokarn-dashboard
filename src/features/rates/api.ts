import { apiFetch } from '@/lib/api/client'
import type { CalendarDay, Plan } from './types'

export function fetchPlans(): Promise<Plan[]> {
  return apiFetch<Plan[]>('/admin/rates/plans', { cache: 'no-store' })
}

export function fetchRateCalendar(
  plan: string,
  from: string,
  to: string,
): Promise<CalendarDay[]> {
  return apiFetch<CalendarDay[]>(
    `/admin/rates/calendar?plan=${plan}&from=${from}&to=${to}`,
    { cache: 'no-store' },
  )
}
