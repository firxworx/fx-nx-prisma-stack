import React, { useMemo, useContext } from 'react'
import { useAsync } from 'react-async-hook'
import { fetchSession } from '../api/auth'
import { Session, SessionActive, SessionStatus } from '../types/session.types'
import { isSessionActive } from '../types/type-guards/session.type-guards'

const SessionContext = React.createContext<Session<SessionStatus> | null>(null)

export const SessionContextProvider: React.FC<{ children: (isSessionReady: boolean) => React.ReactElement }> = ({
  children,
}) => {
  // @todo - consider using useSwr()
  // const { data, error, isValidating } = useSWR('/auth/session', fetchSession)

  // fetch session with setLoading to preserve previous data while loading new data
  const { loading, result, error } = useAsync(fetchSession, [], {
    setLoading: (state) => ({ ...state, loading: true }),
  })

  // memoize to ensure stable value
  const contextValue: Session<SessionStatus> | null = useMemo(() => {
    if (result) {
      return result // set null to trigger infinite reload for dev/debug
    }

    if (loading) {
      return null
    }

    return {
      error: (error instanceof Error && error) || new Error('Unknown error loading user data'),
    }
  }, [loading, result, error])

  const isSessionReady = !!result

  if (isSessionReady) {
    console.log('session ready', JSON.stringify(result))
  }
  return <SessionContext.Provider value={contextValue}>{children(isSessionReady)}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  return ctx
}

export function useSessionError(): Error | null {
  const ctx = useContext(SessionContext)
  return ctx?.error ? ctx.error : null
}

export function useSessionContext(): SessionActive
export function useSessionContext(isActiveSessionOptional: boolean): SessionActive | null
export function useSessionContext(isActiveSessionOptional?: boolean): SessionActive | null {
  const ctx = useContext(SessionContext)

  // this option disables the default behaviour to throw if the session hasn't loaded or is an error
  if (isActiveSessionOptional && (!ctx || ctx.error)) {
    return null
  }

  if (isSessionActive(ctx)) {
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
