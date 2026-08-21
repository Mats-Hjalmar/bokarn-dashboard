import { fetchFrontdesk } from '@/features/bookings'
import { DayLists } from '@/features/frontdesk'
import { getDictionary } from '@/lib/i18n'
import { longDate } from '@/lib/format'

const t = getDictionary()

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const day = await fetchFrontdesk(date)

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">
          {t.frontdesk.heading}
        </h1>
        <p className="text-muted-foreground text-sm">{longDate(day.date)}</p>
      </header>
      <DayLists day={day} />
    </div>
  )
}
