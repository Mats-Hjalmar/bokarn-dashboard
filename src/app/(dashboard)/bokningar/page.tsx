import { BookingList, fetchBookings } from '@/features/bookings'
import { getDictionary } from '@/lib/i18n'

const t = getDictionary()

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; search?: string }>
}) {
  const { state, search } = await searchParams
  const bookings = await fetchBookings({ state, search })

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold tracking-tight">
        {t.bookings.heading}
      </h1>
      <BookingList bookings={bookings} />
    </div>
  )
}
