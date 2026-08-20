'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/client'
import type { Quote } from './types'

export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: string }

/** Reprices a season. The backend recompiles the rate calendar in the same
 *  request, so a saved price is a sellable price. */
export async function repriceSeason(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ days: number }>> {
  // An empty numeric input reads as '' and Number('') is 0, so a cleared field
  // would silently price a whole season at zero and report success. Every field
  // is parsed explicitly and a non-number is refused.
  const money = (field: string): number | null => {
    const raw = String(formData.get(field) ?? '').trim()
    if (raw === '') return null
    const value = Number(raw)
    if (!Number.isFinite(value) || value < 0) return null
    return Math.round(value * 100)
  }
  const count = (field: string): number | null => {
    const raw = String(formData.get(field) ?? '').trim()
    if (raw === '') return null
    const value = Number(raw)
    if (!Number.isInteger(value) || value < 0) return null
    return value
  }

  const base = money('base')
  const adultExtra = money('adult_extra')
  const pet = money('pet')
  const includedAdults = count('included_adults')
  const minStay = count('min_stay')

  if (base === null || base === 0) {
    return { ok: false, error: 'Grundpriset måste vara ett belopp över noll.' }
  }
  if (adultExtra === null || pet === null || includedAdults === null) {
    return { ok: false, error: 'Alla fält måste vara ifyllda med giltiga tal.' }
  }
  if (minStay === null || minStay < 1) {
    return { ok: false, error: 'Minsta antal nätter måste vara minst 1.' }
  }

  const body = {
    base_minor: base,
    included_adults: includedAdults,
    adult_extra_minor: adultExtra,
    pet_minor: pet,
    min_stay: minStay,
  }

  try {
    const data = await apiFetch<{ days: number }>(
      `/admin/rates/seasons/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
    revalidatePath('/priser')
    revalidatePath('/priser/kalender')
    return { ok: true, data }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message }
    return { ok: false, error: 'Kunde inte spara priset.' }
  }
}

/** Prices a stay exactly as the guest site would, so staff can answer "why
 *  does this cost that" without reproducing the booking flow. */
export async function simulate(
  formData: FormData,
): Promise<ActionResult<Quote>> {
  const children = String(formData.get('children') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((date_of_birth) => ({ date_of_birth }))

  try {
    const data = await apiFetch<Quote>('/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_code: formData.get('category'),
        arrival: formData.get('arrival'),
        departure: formData.get('departure'),
        adults: Number(formData.get('adults') ?? 2),
        children,
        pets: Number(formData.get('pets') ?? 0),
        campaign_code: String(formData.get('campaign') ?? '') || undefined,
      }),
    })
    return { ok: true, data }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message }
    return { ok: false, error: 'Kunde inte räkna fram ett pris.' }
  }
}
