'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { kratosStaffURL } from '@/lib/auth/kratos'
import { SESSION_COOKIE, USER_COOKIE } from '@/lib/auth/session'

export type LoginState = { error?: string }

type LoginFlow = { id: string }
type LoginResult = {
  session_token?: string
  session?: { identity?: { traits?: { email?: string; name?: string } } }
  ui?: { messages?: { text: string }[] }
}

/**
 * Signs in against the staff Kratos instance using an API-type flow, which
 * returns the session token in the body rather than setting a cookie on
 * Kratos's own domain — the dashboard and Kratos are different origins, so a
 * browser flow's cookie would never reach us.
 */
export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Fyll i e-post och lösenord.' }
  }

  const base = kratosStaffURL()

  const flowRes = await fetch(`${base}/self-service/login/api`, {
    cache: 'no-store',
  })
  if (!flowRes.ok) {
    return { error: 'Inloggningstjänsten svarar inte. Försök igen.' }
  }
  const flow = (await flowRes.json()) as LoginFlow

  const res = await fetch(`${base}/self-service/login?flow=${flow.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'password', identifier: email, password }),
    cache: 'no-store',
  })

  const result = (await res.json()) as LoginResult

  if (!res.ok || !result.session_token) {
    // Kratos returns the same message for an unknown account and a wrong
    // password, and it is repeated verbatim rather than replaced: telling the
    // two apart is exactly what an attacker wants.
    const message = result.ui?.messages?.[0]?.text
    return { error: message ?? 'Fel e-post eller lösenord.' }
  }

  const jar = await cookies()
  const secure = process.env.NODE_ENV === 'production'
  jar.set(SESSION_COOKIE, result.session_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  jar.set(USER_COOKIE, result.session?.identity?.traits?.email ?? email, {
    httpOnly: false,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  redirect('/kalender')
}

export async function signOut(): Promise<void> {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  jar.delete(USER_COOKIE)
  redirect('/logga-in')
}
