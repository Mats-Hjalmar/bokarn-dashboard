import { notFound } from 'next/navigation'
import { BookingDetailView, fetchBooking } from '@/features/bookings'
import { fetchUnits } from '@/features/inventory'
import { ApiError } from '@/lib/api/client'
import type { BookingDetail } from '@/features/bookings'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let booking: BookingDetail
  try {
    booking = await fetchBooking(id)
  } catch (err) {
    // A mistyped or deleted id is a 404 page, not an error page. Anything else
    // is a real fault and is allowed to reach the error boundary. The JSX is
    // returned outside the try, because a component's own render errors are
    // caught by a boundary rather than by this catch.
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  // Only the pitches this booking could actually move to: same category, still
  // in service, and not the one it is on.
  const units = (await fetchUnits().catch(() => [])).filter(
    (unit) =>
      unit.category_code === booking.category_code &&
      unit.status === 'active' &&
      unit.code !== booking.unit_code,
  )

  return <BookingDetailView booking={booking} units={units} />
}
