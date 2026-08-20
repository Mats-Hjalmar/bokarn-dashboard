import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signOut } from '@/features/auth'
import { visibleSections } from '@/lib/auth/access'
import { fetchMeIfSignedIn } from '@/lib/auth/me'
import { getDictionary } from '@/lib/i18n'

const t = getDictionary()

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // A cookie that the API rejects must send the user to sign in, not throw on
  // every route. Without this a revoked session, a password change or a Kratos
  // restart wedges the whole dashboard behind a stack trace.
  const me = await fetchMeIfSignedIn()
  if (!me) redirect('/logga-in')
  const sections = visibleSections(me.permissions)

  return (
    <div className="flex min-h-screen">
      <aside className="bg-muted/30 flex w-56 shrink-0 flex-col border-r">
        <div className="border-b px-4 py-4">
          <p className="font-semibold tracking-tight">{t.app.name}</p>
          <p className="text-muted-foreground truncate text-xs">
            {me.tenant.name}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {sections.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t px-4 py-3 text-xs">
          <p className="truncate font-medium">{me.user.email}</p>
          <p className="text-muted-foreground truncate">
            {me.roles.join(', ') || '—'}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="text-muted-foreground hover:text-foreground mt-2 underline"
            >
              {t.auth.signOut}
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  )
}
