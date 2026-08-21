'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Allocation, CalendarRow } from '@/features/inventory'
import { getDictionary } from '@/lib/i18n'
import { createBlock, removeBlock } from '../actions'

const t = getDictionary()

/** Every date in [from, to), which is how occupancy is stored. */
function datesIn(from: string, to: string): string[] {
  const out: string[] = []
  const end = new Date(to)
  for (const d = new Date(from); d < end; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

/** The night after `date`, which is the exclusive upper bound of a stay. */
function nextDay(date: string): string {
  const d = new Date(date)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

type Selection = { unitId: string; from: string; to: string }

/**
 * A booking and a broken water tap are not the same thing, and colouring both
 * amber made the chart unreadable: the one screen staff stare at all day could
 * not answer "is this a guest or is this out of service?".
 *
 * A held pitch gets its own colour too, because it is occupancy that will
 * probably evaporate in a quarter of an hour and staff should not phone anyone
 * about it.
 */
function cellColour(a: Allocation): string {
  switch (a.kind) {
    case 'block':
      return 'bg-zinc-400/80 dark:bg-zinc-500/70'
    case 'hold':
      return 'bg-sky-300/70 dark:bg-sky-400/50'
    default:
      return a.state === 'checked_in'
        ? 'bg-emerald-400/85 dark:bg-emerald-500/70'
        : 'bg-amber-400/80 dark:bg-amber-500/60'
  }
}

function cellTitle(a: Allocation | undefined): string | undefined {
  if (!a) return undefined
  if (a.kind === 'block') return a.block_reason ?? t.calendar.blockHeading
  if (a.kind === 'hold') return t.calendar.held
  return [a.reference, a.guest_name].filter(Boolean).join(' · ')
}

export function TapeChart({
  rows,
  from,
  to,
}: {
  rows: CalendarRow[]
  from: string
  to: string
}) {
  const dates = datesIn(from, to)

  const [dragging, setDragging] = useState<Selection | null>(null)
  const [pending, setPending] = useState<Selection | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Occupied nights per unit. A stay is [arrival, departure), so the departure
  // day itself is free — that is what makes same-day turnover sellable.
  const occupied = new Map<string, Map<string, CalendarRow['allocations'][0]>>()
  for (const row of rows) {
    const nights = new Map<string, CalendarRow['allocations'][0]>()
    for (const a of row.allocations) {
      for (const night of datesIn(a.arrival, a.departure)) {
        nights.set(night, a)
      }
    }
    occupied.set(row.unit.id, nights)
  }

  function inSelection(unitId: string, date: string): boolean {
    const s = dragging ?? pending
    if (!s || s.unitId !== unitId) return false
    return date >= s.from && date <= s.to
  }

  function startDrag(unitId: string, date: string) {
    if (occupied.get(unitId)?.has(date)) return
    setError(null)
    setDragging({ unitId, from: date, to: date })
  }

  function extendDrag(unitId: string, date: string) {
    if (!dragging || dragging.unitId !== unitId) return
    const anchor = dragging.from
    setDragging({
      unitId,
      from: date < anchor ? date : anchor,
      to: date < anchor ? anchor : date,
    })
  }

  // Finalising from the cell the pointer is released over, rather than from
  // whatever the last onMouseEnter happened to report, keeps a fast drag from
  // losing its end: pointer movement can skip intermediate cells entirely.
  function endDrag(unitId?: string, date?: string) {
    if (!dragging) return
    const anchor = dragging.from
    const end = unitId === dragging.unitId && date ? date : dragging.to
    setPending({
      unitId: dragging.unitId,
      from: end < anchor ? end : anchor,
      to: end < anchor ? anchor : end,
    })
    setDragging(null)
  }

  async function submit() {
    if (!pending) return
    setBusy(true)
    const result = await createBlock(
      pending.unitId,
      pending.from,
      nextDay(pending.to),
      reason,
    )
    setBusy(false)
    if (result.ok) {
      setPending(null)
      setReason('')
      setError(null)
    } else {
      setError(result.error)
    }
  }

  async function drop(id: string) {
    setBusy(true)
    const result = await removeBlock(id)
    setBusy(false)
    if (!result.ok) setError(result.error)
  }

  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">{t.calendar.empty}</p>
  }

  const template = `10rem repeat(${dates.length}, minmax(1.6rem, 1fr))`

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">{t.calendar.hint}</p>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <ul className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <li className="sr-only">{t.calendar.legend}</li>
        <Key colour="bg-amber-400/80 dark:bg-amber-500/60">
          {t.calendar.legendBooking}
        </Key>
        <Key colour="bg-emerald-400/85 dark:bg-emerald-500/70">
          {t.calendar.legendCheckedIn}
        </Key>
        <Key colour="bg-sky-300/70 dark:bg-sky-400/50">
          {t.calendar.legendHold}
        </Key>
        <Key colour="bg-zinc-400/80 dark:bg-zinc-500/70">
          {t.calendar.legendBlock}
        </Key>
      </ul>

      <div className="overflow-x-auto rounded-lg border select-none">
        <div className="min-w-max">
          <div
            className="bg-muted/50 text-muted-foreground grid text-xs"
            style={{ gridTemplateColumns: template }}
          >
            <div className="px-3 py-2 font-medium">{t.calendar.unit}</div>
            {dates.map((d) => (
              <div key={d} className="border-l py-2 text-center">
                {d.slice(8)}
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div
              key={row.unit.id}
              className="grid border-t text-xs"
              style={{ gridTemplateColumns: template }}
            >
              <div className="truncate px-3 py-1.5 font-medium">
                {row.unit.code}
                <span className="text-muted-foreground ml-2 font-normal">
                  {row.unit.category_code}
                </span>
              </div>

              {dates.map((date) => {
                const allocation = occupied.get(row.unit.id)?.get(date)
                const selected = inSelection(row.unit.id, date)
                return (
                  <button
                    key={date}
                    type="button"
                    title={cellTitle(allocation)}
                    aria-label={`${row.unit.code} ${date}`}
                    onMouseDown={() => startDrag(row.unit.id, date)}
                    onMouseEnter={() => extendDrag(row.unit.id, date)}
                    onMouseUp={() => endDrag(row.unit.id, date)}
                    onDoubleClick={
                      allocation?.kind === 'block'
                        ? () => drop(allocation.id)
                        : undefined
                    }
                    className={[
                      'h-7 border-l transition-colors',
                      allocation
                        ? cellColour(allocation)
                        : selected
                          ? 'bg-sky-400/70'
                          : 'hover:bg-muted',
                    ].join(' ')}
                  >
                    {/*
                      The guest's name is written once per stay, on its first
                      night, and allowed to run over the cells that follow. A
                      name repeated in every cell is unreadable, and a chart
                      with no names on it is a chart reception cannot work
                      from.
                    */}
                    {allocation?.guest_name && allocation.arrival === date ? (
                      <span className="pointer-events-none relative z-10 block w-max max-w-40 truncate pl-1 text-left text-[11px] font-medium text-black/80">
                        {allocation.guest_name}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {pending ? (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
          <div className="text-sm">
            <span className="font-medium">{t.calendar.blockHeading}</span>
            <span className="text-muted-foreground ml-2">
              {pending.from} → {pending.to}
            </span>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{t.calendar.reason}</span>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.calendar.reasonPlaceholder}
              className="border-input bg-background rounded-md border px-3 py-1.5"
            />
          </label>
          <Button onClick={submit} disabled={busy}>
            {t.calendar.save}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setPending(null)
              setError(null)
            }}
            disabled={busy}
          >
            {t.calendar.cancel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function Key({
  colour,
  children,
}: {
  colour: string
  children: React.ReactNode
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`inline-block size-3 rounded-sm ${colour}`} />
      {children}
    </li>
  )
}
