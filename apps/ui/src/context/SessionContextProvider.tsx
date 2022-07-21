import React, { useMemo, useContext } from 'react'
import { useAsync } from 'react-async-hook'
import { fetchSession } from '../api/auth'
import { AuthUser } from '../types/auth.types'
import { Session, SessionActive, SessionStatus } from '../types/session.types'
import { isSessionActive } from '../types/type-guards/session.type-guards'

const SessionContext = React.createContext<{
  profile: Session<SessionStatus>
  refresh: () => Promise<AuthUser>
} | null>(null)

export const SessionContextProvider: React.FC<{
  children: (isSessionReady: boolean) => React.ReactElement
}> = ({ children }) => {
  // @todo - consider using useSwr()
  // const { data, error, isValidating } = useSWR('/auth/session', fetchSession)

  // fetch session with setLoading to preserve previous data while loading new data
  const {
    loading,
    result,
    error,
    execute: refresh,
  } = useAsync(fetchSession, [], {
    setLoading: (state) => ({ ...state, loading: true }),
  })

  // memoize to ensure stable value
  const contextValue: { profile: Session<SessionStatus>; refresh: () => Promise<AuthUser> } | null = useMemo(() => {
    if (result) {
      return { profile: result, refresh } // set null to trigger infinite reload for dev/debug
    }

    if (loading) {
      return null
    }

    return {
      profile: { error: (error instanceof Error && error) || new Error('Unknown error loading user data') },
      refresh,
    }
  }, [loading, result, error, refresh])

  const isSessionReady = !!result

  return <SessionContext.Provider value={contextValue}>{children(isSessionReady)}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  return ctx
}

export function useSessionError(): Error | null {
  const ctx = useContext(SessionContext)
  return ctx?.profile?.error ? ctx.profile.error : null
}

export function useSessionContext(): { profile: SessionActive; refresh: () => Promise<AuthUser> }
export function useSessionContext(
  isActiveSessionOptional: boolean,
): { profile: SessionActive; refresh: () => Promise<AuthUser> } | null
export function useSessionContext(
  isActiveSessionOptional?: boolean,
): { profile: SessionActive; refresh: () => Promise<AuthUser> } | null {
  const ctx = useContext(SessionContext)

  // this option disables the default behaviour to throw if the session hasn't loaded or is an error
  if (isActiveSessionOptional && (!ctx || !ctx?.profile || ctx.profile.error)) {
    return null
  }

  if (isSessionActive(ctx?.profile)) {
    return ctx as { profile: SessionActive; refresh: () => Promise<AuthUser> }
  }

  if (!ctx) {
    throw new Error('User session data not loaded')
  }

  if (ctx.profile.error && ctx.profile.error instanceof Error) {
    throw ctx.profile.error
  }

  throw new Error('Unexpected API data error: failed to obtain a valid user session')
}
