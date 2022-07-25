import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useSession } from '../../context/SessionContextProvider'
import { Spinner } from '../elements/Spinner'

export const SessionLoadingScreen = () => {
  const { push: routerPush } = useRouter()
  const session = useSession()

  // delayed redirect is used to support the back-button
  // this approach does not clobber the user's navigation history vs. router.replace()
  useEffect(() => {
    if (!session.session && session.error) {
      const timeoutId = setTimeout(() => routerPush('/sign-in'), 300)
      return () => clearTimeout(timeoutId)
    }
  }, [session.session, session.error, routerPush])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-100">
      <Spinner />
    </div>
  )
}
