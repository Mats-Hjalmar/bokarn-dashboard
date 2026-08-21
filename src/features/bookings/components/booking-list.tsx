'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { getDictionary } from '@/lib/i18n'
import { money, shortRange } from '@/lib/format'
import type { BookingSummary } from '../types'

const t = getDictionary()

/** The states worth filtering by, in the order reception thinks about them. */
const states = [
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show',
] as const

export function BookingList({ bookings }: { bookings: BookingSummary[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const [search, setSearch] = useState(params.get('search') ?? '')
  const state = params.get('state') ?? ''

  function apply(next: { search?: string; state?: string }) {
    const query = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value) query.set(key, value)
      else query.delete(key)
    }
    startTransition(() => router.push(`/bokningar?${query}`))
  }

  return (
    <div className="grid gap-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          apply({ search })
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">{t.bookings.search}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.bookings.searchPlaceholder}
            className="border-input bg-background w-80 rounded-md border px-3 py-1.5"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">{t.bookings.filterState}</span>
          <select
            value={state}
            onChange={(event) => apply({ state: event.target.value })}
            className="border-input bg-background rounded-md border px-3 py-1.5"
          >
            <option value="">{t.bookings.all}</option>
            {states.map((value) => (
              <option key={value} value={value}>
                {t.states[value]}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" disabled={pending}>
          {t.bookings.search}
        </Button>
      </form>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
          {t.bookings.empty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-4xl text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
              <tr>
                <th className="px-3 py-2 font-medium">
                  {t.bookings.reference}
                </th>
                <th className="px-3 py-2 font-medium">{t.bookings.guest}</th>
                <th className="px-3 py-2 font-medium">{t.bookings.category}</th>
                <th className="px-3 py-2 font-medium">{t.bookings.unit}</th>
                <th className="px-3 py-2 font-medium">{t.bookings.stay}</th>
                <th className="px-3 py-2 font-medium">{t.bookings.party}</th>
                <th className="px-3 py-2 text-right font-medium">
                  {t.bookings.total}
                </th>
                <th className="px-3 py-2 font-medium">{t.bookings.state}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="px-3 py-2 font-mono">
                    <Link
                      href={`/bokningar/${booking.id}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {booking.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{booking.guest_name}</td>
                  <td className="px-3 py-2">{booking.category_name}</td>
                  <td className="px-3 py-2">
                    {booking.unit_code || (
                      <span className="text-muted-foreground">
                        {t.bookings.pitchPending}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {shortRange(booking.arrival, booking.departure)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {party(booking)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {money(booking.total_gross_minor, booking.currency)}
                  </td>
                  <td className="px-3 py-2">
                    <StateBadge state={booking.state} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/** Adults, children and pets as reception reads them: 2+1 · 🐕 */
function party(booking: BookingSummary): string {
  const people =
    booking.children > 0
      ? `${booking.adults}+${booking.children}`
      : String(booking.adults)
  return booking.pets > 0 ? `${people} · ${booking.pets} 🐾` : people
}

export function StateBadge({ state }: { state: string }) {
  // Colour carries the same meaning here as on the tape chart, deliberately: a
  // green cell and a green badge should mean the same thing to the same person
  // an hour later.
  const tone =
    state === 'checked_in'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
      : state === 'cancelled' || state === 'no_show' || state === 'expired'
        ? 'bg-muted text-muted-foreground'
        : state === 'checked_out'
          ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {t.states[state] ?? state}
    </span>
  )
}
