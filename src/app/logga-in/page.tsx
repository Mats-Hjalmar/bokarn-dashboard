import { redirect } from 'next/navigation'
import { LoginForm } from '@/features/auth'
import { fetchMeIfSignedIn } from '@/lib/auth/me'
import { getSessionToken } from '@/lib/auth/session'
import { getDictionary } from '@/lib/i18n'

const t = getDictionary()

export default async function LoginPage() {
  // Redirect only for a session the API actually accepts. Redirecting on the
  // mere presence of a cookie made a stale one unrecoverable: sign-in bounced
  // to the dashboard, and the dashboard threw. A rejected cookie is left in
  // place — cookies cannot be written during a render, and signing in
  // overwrites it anyway.
  if ((await getSessionToken()) && (await fetchMeIfSignedIn())) {
    redirect('/kalender')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t.app.name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t.auth.subheading}
        </p>
      </header>
      <LoginForm />
    </main>
  )
}
