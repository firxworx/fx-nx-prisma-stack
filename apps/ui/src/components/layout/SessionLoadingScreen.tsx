import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { EmojiHappyIcon } from '@heroicons/react/outline'
import { useSessionError } from '../../context/SessionContextProvider'

export const SessionLoadingScreen = () => {
  const { push } = useRouter()
  const error = useSessionError()

  // delayed redirect is used to support the back-button
  // the approach does not clobber the user's navigation history vs. router.replace()
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => push('/sign-in'), 300)
      return () => clearTimeout(timeoutId)
    }
  }, [error, push])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-100">
      <EmojiHappyIcon className="w-auto h-8 animate-pulse" />
    </div>
  )
}
