'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/client'

export type BlockResult = { ok: true } | { ok: false; error: string }

export async function createBlock(
  unitId: string,
  arrival: string,
  departure: string,
  reason: string,
): Promise<BlockResult> {
  try {
    await apiFetch('/admin/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unit_id: unitId,
        arrival,
        departure,
        reason,
      }),
    })
    revalidatePath('/kalender')
    return { ok: true }
  } catch (err) {
    // A 409 is the database refusing an overlap. It is the expected answer to a
    // staff member selecting over something, not a fault, so it is shown as
    // written rather than replaced with a generic failure.
    if (err instanceof ApiError) return { ok: false, error: err.message }
    return { ok: false, error: 'Kunde inte spärra platsen.' }
  }
}

export async function removeBlock(id: string): Promise<BlockResult> {
  try {
    await apiFetch(`/admin/blocks/${id}`, { method: 'DELETE' })
    revalidatePath('/kalender')
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message }
    return { ok: false, error: 'Kunde inte ta bort spärren.' }
  }
}
