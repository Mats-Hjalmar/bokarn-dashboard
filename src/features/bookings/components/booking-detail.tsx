'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dateTime, longDate, money } from '@/lib/format'
import { getDictionary } from '@/lib/i18n'
import { cancelBooking, checkIn, checkOut, reassign } from '../actions'
import type { BookingDetail } from '../types'
import type { Unit } from '@/features/inventory'
import { StateBadge } from './booking-list'

const t = getDictionary()

export function BookingDetailView({
  booking,
  units,
}: {
  booking: BookingDetail
  units: Unit[]
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('')
  const [moveTo, setMoveTo] = useState('')

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true)
    setError(null)
    const result = await action()
    setBusy(false)
    if (!result.ok) {
      setError(result.error ?? t.common.failed)
      return
    }
    setCancelling(false)
    setMoveTo('')
  }

  return (
    <div className="grid gap-6">
      <Link
        href="/bokningar"
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t.bookings.back}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold tracking-widest">
              {booking.reference}
            </h1>
            <StateBadge state={booking.state} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {booking.guest_name} · {booking.category_name} ·{' '}
            {longDate(booking.arrival)} → {longDate(booking.departure)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.state === 'confirmed' ? (
            <>
              <Button
                disabled={busy}
                onClick={() => run(() => checkIn(booking.id))}
              >
                {busy ? t.frontdesk.working : t.frontdesk.checkIn}
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setCancelling((open) => !open)}
              >
                {t.bookings.cancel}
              </Button>
            </>
          ) : null}
          {booking.state === 'checked_in' ? (
            <Button
              disabled={busy}
              onClick={() => run(() => checkOut(booking.id))}
            >
              {busy ? t.frontdesk.working : t.frontdesk.checkOut}
            </Button>
          ) : null}
        </div>
      </header>

      {error ? (
        <p
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex items-start gap-2 rounded-lg border p-3 text-sm"
        >
          <AlertCircle
            className="text-destructive mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          {error}
        </p>
      ) : null}

      {cancelling ? (
        <div className="grid gap-3 rounded-lg border p-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">{t.bookings.cancelReason}</span>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t.bookings.cancelReasonPlaceholder}
              className="border-input bg-background rounded-md border px-3 py-1.5"
            />
          </label>
          <p className="text-muted-foreground text-xs">
            {t.bookings.cancelHint}
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              disabled={busy || reason.trim() === ''}
              onClick={() =>
                run(() => cancelBooking(booking.id, reason.trim()))
              }
            >
              {t.bookings.cancelConfirm}
            </Button>
            <Button variant="ghost" onClick={() => setCancelling(false)}>
              {t.calendar.cancel}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="grid gap-4 lg:col-span-2">
          <Panel title={t.bookings.breakdown}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left text-xs">
                  <th className="py-2 pr-4 font-medium">{t.bookings.line}</th>
                  <th className="py-2 pr-4 text-right font-medium">
                    {t.bookings.vat}
                  </th>
                  <th className="py-2 text-right font-medium">
                    {t.bookings.amount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {booking.lines.map((line) => (
                  <tr key={line.seq} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      {line.description}
                      {line.stay_date ? (
                        <span className="text-muted-foreground">
                          {' · '}
                          {line.stay_date}
                        </span>
                      ) : null}
                    </td>
                    <td className="text-muted-foreground py-2 pr-4 text-right tabular-nums">
                      {money(line.vat_minor, booking.currency)}{' '}
                      <span className="text-xs">
                        ({line.vat_rate_bp / 100}%)
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {money(line.gross_minor, booking.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2">
                  <th className="py-2 pr-4 text-left font-semibold">
                    {t.bookings.total}
                  </th>
                  <td className="text-muted-foreground py-2 pr-4 text-right tabular-nums">
                    {money(booking.total_vat_minor, booking.currency)}
                  </td>
                  <td className="py-2 text-right font-semibold tabular-nums">
                    {money(booking.total_gross_minor, booking.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Panel>

          <Panel title={t.bookings.history}>
            <ol className="grid gap-2 text-sm">
              {booking.events.map((event, index) => (
                <li key={index} className="flex flex-wrap gap-x-2">
                  <span className="text-muted-foreground tabular-nums">
                    {dateTime(event.created_at)}
                  </span>
                  <span className="font-medium">
                    {t.events[event.kind] ?? event.kind}
                  </span>
                  <span className="text-muted-foreground">
                    {event.actor_name ?? t.actors[event.actor] ?? event.actor}
                  </span>
                  {event.detail ? (
                    <span className="text-muted-foreground">
                      {Object.entries(event.detail)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </Panel>
        </section>

        <section className="grid gap-4">
          <Panel title={t.bookings.contact}>
            <dl className="grid gap-2 text-sm">
              <Row label={t.bookings.guest} value={booking.guest_name} />
              <Row label="E-post" value={booking.email} />
              <Row label="Telefon" value={booking.phone} />
              <Row
                label={t.bookings.residence}
                value={booking.country_of_residence}
              />
              <Row
                label={t.bookings.booked}
                value={`${dateTime(booking.confirmed_at)} · ${
                  booking.channel === 'web'
                    ? t.bookings.channelWeb
                    : t.bookings.channelDesk
                }`}
              />
            </dl>
          </Panel>

          <Panel title={t.bookings.unit}>
            <p className="text-sm">
              {booking.unit_code ? (
                <>
                  <span className="font-medium">{booking.unit_code}</span>
                  {booking.unit_pinned ? (
                    <span className="text-muted-foreground">
                      {' '}
                      ({t.bookings.pinned})
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-muted-foreground">
                  {t.bookings.pitchPending}
                </span>
              )}
            </p>

            {/*
              Moving a guest is offered while they are booked or on site, and
              only within their category — a four-berth cabin is not a
              substitute for a pitch. The database refuses a move onto an
              occupied pitch, so there is no availability check here: asking
              first would be a race as well as a second copy of the same rule.
            */}
            {units.length > 0 &&
            (booking.state === 'confirmed' ||
              booking.state === 'checked_in') ? (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <label className="grid gap-1.5 text-sm">
                  <span className="text-muted-foreground text-xs">
                    {t.bookings.moveTo}
                  </span>
                  <select
                    value={moveTo}
                    onChange={(event) => setMoveTo(event.target.value)}
                    className="border-input bg-background rounded-md border px-3 py-1.5"
                  >
                    <option value="">—</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.code}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || moveTo === ''}
                  onClick={() => run(() => reassign(booking.id, moveTo))}
                >
                  {t.bookings.move}
                </Button>
              </div>
            ) : null}
          </Panel>

          <Panel title={t.bookings.requirements}>
            {booking.requirements.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t.bookings.noRequirements}
              </p>
            ) : (
              <ul className="grid gap-1 text-sm">
                {booking.requirements.map((r) => (
                  <li key={r.attr_key}>
                    {t.attributes[r.attr_key as keyof typeof t.attributes] ??
                      r.attr_key}{' '}
                    {r.op} {r.value}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {booking.notes ? (
            <Panel title={t.bookings.notes}>
              <p className="text-sm">{booking.notes}</p>
            </Panel>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}
