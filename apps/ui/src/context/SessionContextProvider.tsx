import React, { useMemo, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSession } from '../api/auth'
import { AuthUser } from '../types/auth.types'
import { AuthSession, SessionStatus } from '../types/session.types'
import { isAuthSessionResult } from '../types/type-guards/auth.type-guards'

const SessionContext = React.createContext<AuthSession<SessionStatus> | null>(null)

export const SessionContextProvider: React.FC<{
  children: (isSessionReady: boolean) => React.ReactElement
}> = ({ children }) => {
  const {
    data: session,
    refetch,
    error,
    status,
  } = useQuery<AuthUser>(['session'], fetchSession, { retry: false, refetchInterval: 900000 })

  // memoize to ensure a stable context value
  const contextValue: AuthSession<SessionStatus> | null = useMemo(() => {
    if (session) {
      return { session, refetch } // reminder: set null to trigger infinite reload for dev/debug
    }

    if (status === 'loading') {
      return null
    }

    return {
      session: undefined,
      error: (error instanceof Error && error) || new Error(`Unexpected error loading user session: ${String(error)}`),
      refetch,
    }
  }, [session, error, status, refetch])

  const isSessionReady = status !== 'loading' && !!session
  return <SessionContext.Provider value={contextValue}>{children(isSessionReady)}</SessionContext.Provider>
}

export function useSession(): AuthSession<SessionStatus> | null {
  const ctx = useContext(SessionContext)
  return ctx
}

export function useSessionError(): Error | null {
  const ctx = useContext(SessionContext)
  return ctx?.error ? ctx.error : null
}

export function useSessionContext(): AuthSession<SessionStatus.READY>
export function useSessionContext(isSessionOptional: boolean): AuthSession<SessionStatus.READY> | null
export function useSessionContext(isSessionOptional?: boolean): AuthSession<SessionStatus.READY> | null {
  const ctx = useContext(SessionContext)

  // the optional flag disables the default behaviour to throw if the session hasn't loaded or there's an error
  if (isSessionOptional && (!ctx || !ctx?.session || !!ctx.error)) {
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
