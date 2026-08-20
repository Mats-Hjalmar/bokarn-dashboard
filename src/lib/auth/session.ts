import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Browsers scope cookies by host and ignore the port, so on localhost the
// dashboard and the guest site share one jar. Identically named cookies would
// silently overwrite each other and log staff out at random.
export const SESSION_COOKIE = 'bokarn_staff_session'
export const USER_COOKIE = 'bokarn_staff_user'

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null
}

/** Redirects to the sign-in page when there is no session. */
export async function requireSession(): Promise<string> {
  const token = await getSessionToken()
  if (!token) redirect('/logga-in')
  return token
}

/**
 * Drops the session cookies.
 *
 * Only callable from a server action or route handler — Next refuses cookie
 * writes during a render. That is why a stale cookie is *tolerated* rather than
 * cleared on the way past: the sign-in page renders regardless and a successful
 * sign-in overwrites it.
 */
export async function clearSession(): Promise<void> {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  jar.delete(USER_COOKIE)
}
