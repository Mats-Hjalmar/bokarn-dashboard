import Link from 'next/link'
import { fetchCalendar, TapeChart } from '@/features/calendar'
import { getDictionary } from '@/lib/i18n'

const t = getDictionary()

/** Days shown at once. Wide enough to plan a stay, narrow enough to read. */
const WINDOW_DAYS = 30

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function shift(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return isoDate(d)
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from: requested } = await searchParams
  // A supplied window is trusted only as far as being a date; anything else
  // falls back to today rather than being passed to the API to fail there.
  const from =
    requested && /^\d{4}-\d{2}-\d{2}$/.test(requested)
      ? requested
      : isoDate(new Date())
  const to = shift(from, WINDOW_DAYS)

  const rows = await fetchCalendar(from, to)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.calendar.heading}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {from} → {to}
          </p>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link
            href={`/kalender?from=${shift(from, -WINDOW_DAYS)}`}
            className="hover:bg-muted rounded-md border px-3 py-1.5"
          >
            ←
          </Link>
          <Link
            href="/kalender"
            className="hover:bg-muted rounded-md border px-3 py-1.5"
          >
            Idag
          </Link>
          <Link
            href={`/kalender?from=${shift(from, WINDOW_DAYS)}`}
            className="hover:bg-muted rounded-md border px-3 py-1.5"
          >
            →
          </Link>
        </nav>
      </header>

      <TapeChart rows={rows} from={from} to={to} />
    </div>
  )
}
