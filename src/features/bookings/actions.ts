'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/client'
import { getDictionary } from '@/lib/i18n'

const t = getDictionary()

export type ActionResult = { ok: true } | { ok: false; error: string }

/**
 * The four transitions reception drives.
 *
 * Each revalidates both screens it could have been triggered from, because a
 * check-in changes the arrivals list and the tape chart at once, and a stale
 * chart is how two receptionists send two families to one pitch.
 */
async function transition(
  id: string,
  action: string,
  body?: unknown,
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/bookings/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
    revalidatePath('/reception')
    revalidatePath('/kalender')
    revalidatePath('/bokningar')
    revalidatePath(`/bokningar/${id}`)
    return { ok: true }
  } catch (err) {
    // A 409 is the API saying the booking is not in a state that allows this —
    // usually because a colleague got there first. That is the answer, not a
    // fault, so it is shown as written.
    if (err instanceof ApiError) return { ok: false, error: err.message }
    return { ok: false, error: t.common.failed }
  }
}

// Each of these is declared async even though it only forwards a promise: a
// Server Action has to be an async function, and Turbopack refuses the build
// rather than shipping one that is not.
export async function checkIn(id: string): Promise<ActionResult> {
  return transition(id, 'check-in')
}

export async function checkOut(id: string): Promise<ActionResult> {
  return transition(id, 'check-out')
}

export async function cancelBooking(
  id: string,
  reason: string,
): Promise<ActionResult> {
  return transition(id, 'cancel', { reason })
}

export async function reassign(
  id: string,
  unitId: string,
): Promise<ActionResult> {
  return transition(id, 'reassign', { unit_id: unitId })
}
