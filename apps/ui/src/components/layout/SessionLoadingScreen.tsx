import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useSessionContext } from '../../context/SessionContextProvider'
import { Spinner } from '@firx/react-feedback'

export const SessionLoadingScreen: React.FC = () => {
  const { push: routerPush } = useRouter()
  const session = useSessionContext()

  const userSession = session?.profile
  const userSessionError = session?.error

  // delayed redirect is used to support the back-button
  // this approach does not clobber the user's navigation history vs. router.replace()
  useEffect(() => {
    if (!userSession && userSessionError) {
      const timeoutId = setTimeout(() => routerPush('/sign-in'), 300)
      return () => clearTimeout(timeoutId)
    }
  }, [userSession, userSessionError, routerPush])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-100">
      <Spinner />
    </div>
  )
}
