'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { AlertCircle, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { money, shortRange } from '@/lib/format'
import { getDictionary } from '@/lib/i18n'
import { checkIn, checkOut } from '@/features/bookings/actions'
import type { BookingSummary, Frontdesk } from '@/features/bookings'

const t = getDictionary()

/**
 * Reception's day, as three lists.
 *
 * Each list is defined by state rather than by a flag anyone ticks: a guest
 * leaves the arrivals list by being checked in, and appears in-house by the same
 * act. There is nothing to keep in step because there is only one fact.
 */
export function DayLists({ day }: { day: Frontdesk }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function act(
    id: string,
    action: (id: string) => Promise<{ ok: boolean; error?: string }>,
  ) {
    setBusy(id)
    setError(null)
    const result = await action(id)
    setBusy(null)
    if (!result.ok) setError(result.error ?? t.common.failed)
  }

  function changeDate(date: string) {
    startTransition(() => router.push(`/reception?date=${date}`))
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">{t.frontdesk.date}</span>
          <input
            type="date"
            value={day.date}
            disabled={pending}
            onChange={(event) => changeDate(event.target.value)}
            className="border-input bg-background rounded-md border px-3 py-1.5"
          />
        </label>
        {/*
          Reception prints the arrivals list every morning and works from paper
          when the wifi in the office drops. The print styles are not decoration.
        */}
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden />
          {t.frontdesk.print}
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex items-start gap-2 rounded-lg border p-3 text-sm print:hidden"
        >
          <AlertCircle
            className="text-destructive mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          {error}
        </p>
      ) : null}

      <List
        title={t.frontdesk.arrivals}
        empty={t.frontdesk.noArrivals}
        bookings={day.arrivals}
        action={{
          label: t.frontdesk.checkIn,
          run: (id) => act(id, checkIn),
        }}
        busy={busy}
      />

      <List
        title={t.frontdesk.departures}
        empty={t.frontdesk.noDepartures}
        bookings={day.departures}
        action={{
          label: t.frontdesk.checkOut,
          run: (id) => act(id, checkOut),
        }}
        busy={busy}
      />

      <List
        title={t.frontdesk.inHouse}
        empty={t.frontdesk.noInHouse}
        bookings={day.in_house}
        busy={busy}
      />
    </div>
  )
}

function List({
  title,
  empty,
  bookings,
  action,
  busy,
}: {
  title: string
  empty: string
  bookings: BookingSummary[]
  action?: { label: string; run: (id: string) => void }
  busy: string | null
}) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-2 text-sm font-semibold">
        {title}{' '}
        <span className="text-muted-foreground font-normal">
          ({bookings.length})
        </span>
      </h2>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          {empty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-2xl text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
              <tr>
                <th className="px-3 py-2 font-medium">{t.bookings.unit}</th>
                <th className="px-3 py-2 font-medium">{t.bookings.guest}</th>
                <th className="px-3 py-2 font-medium">
                  {t.bookings.reference}
                </th>
                <th className="px-3 py-2 font-medium">{t.bookings.stay}</th>
                <th className="px-3 py-2 font-medium">{t.bookings.party}</th>
                <th className="px-3 py-2 text-right font-medium">
                  {t.bookings.total}
                </th>
                {action ? (
                  <th className="px-3 py-2 font-medium print:hidden" />
                ) : null}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="px-3 py-2 font-medium">
                    {booking.unit_code || '—'}
                  </td>
                  <td className="px-3 py-2">{booking.guest_name}</td>
                  <td className="px-3 py-2 font-mono">
                    <Link
                      href={`/bokningar/${booking.id}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {booking.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {shortRange(booking.arrival, booking.departure)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {booking.children > 0
                      ? `${booking.adults}+${booking.children}`
                      : booking.adults}
                    {booking.pets > 0 ? ` · ${booking.pets} 🐾` : ''}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {money(booking.total_gross_minor, booking.currency)}
                  </td>
                  {action ? (
                    <td className="px-3 py-2 text-right print:hidden">
                      <Button
                        size="sm"
                        disabled={busy === booking.id}
                        onClick={() => action.run(booking.id)}
                      >
                        {busy === booking.id
                          ? t.frontdesk.working
                          : action.label}
                      </Button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
