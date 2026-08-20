'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { simulate } from '../actions'
import type { Quote } from '../types'

const kr = (minor: number) => (minor / 100).toFixed(2)

/**
 * The "why this price" screen. The engine already emits an ordered explain
 * trace, so surfacing it costs almost nothing and turns a support ticket into
 * something reception can answer while the guest is still on the phone.
 */
export function QuoteSimulator({ categories }: { categories: string[] }) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function run(formData: FormData) {
    setBusy(true)
    const result = await simulate(formData)
    setBusy(false)
    if (result.ok) {
      setQuote(result.data)
      setError(null)
    } else {
      setQuote(null)
      setError(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={run} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Kategori</span>
          <select
            name="category"
            className="border-input bg-background rounded-md border px-2 py-1.5 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <Text name="arrival" label="Ankomst" placeholder="2027-07-04" />
        <Text name="departure" label="Avresa" placeholder="2027-07-11" />
        <Num name="adults" label="Vuxna" value="2" />
        <Text name="children" label="Barn (födelsedatum, komma)" wide />
        <Num name="pets" label="Husdjur" value="0" />
        <Text name="campaign" label="Kampanjkod" />
        <Button type="submit" disabled={busy}>
          Räkna
        </Button>
      </form>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {quote ? (
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="mb-2 text-sm font-medium">Så blev priset</h2>
            <ol className="flex flex-col gap-1 text-sm">
              {quote.explain.map((step, i) => (
                <li
                  key={i}
                  className="flex justify-between gap-4 border-b py-1"
                >
                  <span>
                    <span className="text-muted-foreground mr-2 font-mono text-xs">
                      {step.rule}
                    </span>
                    {step.detail}
                  </span>
                  <span className="font-mono">{kr(step.effect_minor)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium">
              Rader ({quote.nights} nätter)
            </h2>
            <table className="w-full text-sm">
              <tbody>
                {quote.lines.map((l) => (
                  <tr key={l.seq} className="border-b">
                    <td className="py-1 font-mono text-xs">
                      {l.stay_date ?? ''}
                    </td>
                    <td className="py-1">{l.kind}</td>
                    <td className="text-muted-foreground py-1 text-right text-xs">
                      {(l.vat_rate_bp / 100).toFixed(0)}% moms
                    </td>
                    <td className="py-1 text-right font-mono">
                      {kr(l.gross_minor)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-medium">
                  <td colSpan={2} className="pt-2">
                    Totalt
                  </td>
                  <td className="text-muted-foreground pt-2 text-right text-xs">
                    varav moms {kr(quote.totals.vat_minor)}
                  </td>
                  <td className="pt-2 text-right font-mono">
                    {kr(quote.totals.gross_minor)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function Text({
  name,
  label,
  placeholder,
  wide,
}: {
  name: string
  label: string
  placeholder?: string
  wide?: boolean
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        className={`border-input bg-background rounded-md border px-2 py-1.5 text-sm ${wide ? 'w-56' : 'w-32'}`}
      />
    </label>
  )
}

function Num({
  name,
  label,
  value,
}: {
  name: string
  label: string
  value: string
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        name={name}
        type="number"
        min="0"
        defaultValue={value}
        className="border-input bg-background w-20 rounded-md border px-2 py-1.5 text-sm"
      />
    </label>
  )
}
