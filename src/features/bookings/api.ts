import { apiFetch } from '@/lib/api/client'
import type { BookingDetail, BookingSummary, Frontdesk } from './types'

export function fetchBookings(
  filter: { state?: string; search?: string } = {},
): Promise<BookingSummary[]> {
  const params = new URLSearchParams()
  if (filter.state) params.set('state', filter.state)
  if (filter.search) params.set('search', filter.search)
  const query = params.size > 0 ? `?${params}` : ''
  return apiFetch<BookingSummary[]>(`/admin/bookings${query}`, {
    cache: 'no-store',
  })
}

export function fetchBooking(id: string): Promise<BookingDetail> {
  return apiFetch<BookingDetail>(`/admin/bookings/${id}`, {
    cache: 'no-store',
  })
}

export function fetchFrontdesk(date?: string): Promise<Frontdesk> {
  const query = date ? `?date=${date}` : ''
  return apiFetch<Frontdesk>(`/admin/frontdesk${query}`, { cache: 'no-store' })
}
