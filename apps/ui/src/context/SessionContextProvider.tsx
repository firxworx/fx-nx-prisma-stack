import React, { useMemo, useContext } from 'react'

import { useApiSession } from '../api/auth'
import { isAuthSessionResult } from '../types/type-guards/auth.type-guards'
import type { AuthSession } from '../types/session.types'
import type { SessionStatus } from '../types/enums/session.enums'

const SessionContext = React.createContext<AuthSession<SessionStatus> | null>(null)

export const SessionContextProvider: React.FC<{
  children: (isSessionReady: boolean) => React.ReactElement
}> = ({ children }) => {
  const { data: profile, refetch, error, status, invalidate, remove } = useApiSession()

  // memoize to ensure a stable context value
  const contextValue: AuthSession<SessionStatus> | null = useMemo(() => {
    const isLoading = status === 'loading'

    if (profile) {
      return { profile, isLoading, refetch, invalidate, remove }
    }

    return {
      session: undefined,
      error: (error instanceof Error && error) || new Error(`Unexpected error loading session: ${String(error)}`),
      isLoading,
      refetch,
      invalidate,
      remove,
    }
  }, [profile, status, error, refetch, invalidate, remove])

  const isSessionReady = status !== 'loading' && !!profile
  return <SessionContext.Provider value={contextValue}>{children(isSessionReady)}</SessionContext.Provider>
}

export function useSessionContext(): AuthSession<SessionStatus> | null {
  const ctx = useContext(SessionContext)
  return ctx
}

export function useAuthSession(): AuthSession<SessionStatus.READY>
export function useAuthSession(isSessionOptional: boolean): AuthSession<SessionStatus.READY> | null
export function useAuthSession(isSessionOptional?: boolean): AuthSession<SessionStatus.READY> | null {
  const ctx = useContext(SessionContext)

  // the optional flag disables the default behaviour to throw if the session hasn't loaded yet
  if (isSessionOptional && (!ctx || !ctx?.profile)) {
    return null
  }

  if (isAuthSessionResult(ctx)) {
    return ctx
  }

  if (!ctx) {
    throw new Error('User session data not loaded')
  }

  if (ctx.error && ctx.error instanceof Error) {
    throw ctx.error
  }

  throw new Error('Unexpected API data error: failed to obtain a valid user session')
}
