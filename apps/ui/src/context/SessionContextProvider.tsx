import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react'

import { LOCAL_STORAGE_SESSION_CTX_FLAG_KEY } from '../api/constants/auth'
import type { AuthSession } from '../types/session.types'
import type { SessionStatus } from '../types/enums/session.enums'
import { useAuthSessionQuery } from '../api/hooks/auth'
import { isAuthSessionResult } from '../types/type-guards/auth.type-guards'

const SessionContext = React.createContext<AuthSession<SessionStatus> | undefined>(undefined)

/**
 * React context provider of a user's session context.
 *
 * The initial `true` state of `isQueryEnabled` will result in an immediate request to the API `/auth/session`
 * endpoint on page load/refresh. The response indicates if the user is authenticated and provides a means
 * to set the CSRF cookie.
 */
export const SessionContextProvider: React.FC<{
  children: (isSessionReady: boolean) => React.ReactElement
}> = ({ children }) => {
  const [isQueryEnabled, setIsQueryEnabled] = useState<boolean>(true)
  const { data: profile, refetch, error, status, invalidate, remove } = useAuthSessionQuery(isQueryEnabled) // ...rest

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ctxEnabledFlag = window.localStorage.getItem(LOCAL_STORAGE_SESSION_CTX_FLAG_KEY)

      if (ctxEnabledFlag === 'enabled') {
        setIsQueryEnabled(true)
      } else {
        setIsQueryEnabled(false)
      }
    }
  }, [])

  const setEnabled = useCallback(
    (nextState: boolean) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCAL_STORAGE_SESSION_CTX_FLAG_KEY, nextState ? 'enabled' : 'disabled')
      }
      setIsQueryEnabled(nextState)
    },
    [setIsQueryEnabled],
  )

  // memoize to ensure stable context value
  const contextValue: AuthSession<SessionStatus> | undefined = useMemo(() => {
    const isLoading = status === 'loading'

    if (profile) {
      return { profile, setEnabled, isLoading, refetch, invalidate, remove }
    }

    return {
      error: (error instanceof Error && error) || new Error(`Unexpected error loading session: ${String(error)}`),
      setEnabled,
      isLoading,
      refetch,
      invalidate,
      remove,
    }
  }, [profile, status, error, setEnabled, refetch, invalidate, remove])

  // console.log(`SessionContextProvider: [enabled, ${isQueryEnabled}], [status, ${status}], [profile, ${!!profile}]`)
  // console.log('profile value', JSON.stringify(profile, null, 2))

  const isSessionReady = status !== 'loading' && !!profile
  return <SessionContext.Provider value={contextValue}>{children(isSessionReady)}</SessionContext.Provider>
}

export function useSessionContext(): AuthSession<SessionStatus> | undefined {
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
