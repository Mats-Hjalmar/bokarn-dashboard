'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { signIn, type LoginState } from '../api'

const initial: LoginState = {}

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">E-post</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Lösenord</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Loggar in…' : 'Logga in'}
      </Button>
    </form>
  )
}
