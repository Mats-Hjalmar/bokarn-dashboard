'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { repriceSeason } from '../actions'
import type { Season } from '../types'

const kr = (minor: number) => (minor / 100).toFixed(2)

const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

/** Renders which weekdays a stay may start on. A cabin sold Saturday to
 *  Saturday is the normal case, and staff need to see it at a glance. */
function arrivalDays(mask: number): string {
  if (mask === 127) return 'Alla dagar'
  const days = WEEKDAYS.filter((_, i) => (mask & (1 << i)) !== 0)
  return days.length ? days.join(', ') : 'Inga'
}

export function SeasonEditor({ season }: { season: Season }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function save(formData: FormData) {
    setBusy(true)
    const result = await repriceSeason(season.id, formData)
    setBusy(false)
    if (result.ok) {
      setMessage(`Sparat – ${result.data.days} nätter räknades om.`)
      setError(null)
      setOpen(false)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-medium">{season.name}</p>
          <p className="text-muted-foreground text-xs">
            {season.starts_on} → {season.ends_on} · prioritet {season.priority}{' '}
            · ankomst {arrivalDays(season.arrival_mask)} · min {season.min_stay}{' '}
            nätter
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm">{kr(season.base_minor)} kr</span>
          <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
            {open ? 'Stäng' : 'Ändra'}
          </Button>
        </div>
      </div>

      {message ? (
        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {open ? (
        <form action={save} className="mt-4 flex flex-wrap items-end gap-3">
          <Field name="base" label="Grundpris" value={kr(season.base_minor)} />
          <Field
            name="adult_extra"
            label="Extra vuxen"
            value={kr(season.adult_extra_minor)}
          />
          <Field name="pet" label="Husdjur" value={kr(season.pet_minor)} />
          <Field
            name="included_adults"
            label="Ingår vuxna"
            value={String(season.included_adults)}
            step="1"
          />
          <Field
            name="min_stay"
            label="Min nätter"
            value={String(season.min_stay)}
            step="1"
          />
          <Button type="submit" disabled={busy}>
            Spara
          </Button>
        </form>
      ) : null}
    </div>
  )
}

function Field({
  name,
  label,
  value,
  step = '0.01',
}: {
  name: string
  label: string
  value: string
  step?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        name={name}
        type="number"
        step={step}
        min="0"
        required
        defaultValue={value}
        className="border-input bg-background w-28 rounded-md border px-2 py-1.5 text-sm"
      />
    </label>
  )
}
