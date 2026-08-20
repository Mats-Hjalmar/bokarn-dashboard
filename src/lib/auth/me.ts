import 'server-only'
import { ApiError, apiFetch } from '@/lib/api/client'

export type Me = {
  user: { id: string; email: string; name: string }
  tenant: { id: string; slug: string; name: string }
  roles: string[]
  permissions: string[]
}

/** The signed-in staff member, the operator they act for, and their access. */
export function fetchMe(): Promise<Me> {
  return apiFetch<Me>('/me', { cache: 'no-store' })
}

/**
 * The caller, or null when the session is not valid. Distinguishing "rejected"
 * from "broken" matters: a 401 means sign in again, anything else is a real
 * fault and must not be mistaken for a logged-out user.
 */
export async function fetchMeIfSignedIn(): Promise<Me | null> {
  try {
    return await fetchMe()
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return null
    }
    throw err
  }
}
