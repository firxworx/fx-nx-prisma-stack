import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useAuthSignOut } from '../../api/auth'
import { useIsMounted } from '../../hooks/useIsMounted'
import { Spinner } from '../elements/feedback/Spinner'

export interface SignOutButtonProps {
  signOutRedirectPath?: string
  onSignOut?: () => Promise<unknown>
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({ signOutRedirectPath, onSignOut }) => {
  const isMounted = useIsMounted()
  const { push: routerPush } = useRouter()

  const { signOut, isLoading, isSuccess } = useAuthSignOut() // @todo - add errors globally (toast?) or to sign-out (isError)

  useEffect(() => {
    if (isSuccess) {
      if (typeof onSignOut === 'function') {
        onSignOut()
      }

      if (isMounted()) {
        routerPush(signOutRedirectPath ?? process.env.NEXT_PUBLIC_DEFAULT_SIGN_OUT_REDIRECT_PATH ?? '/')
      }
    }
  }, [isSuccess, isMounted, routerPush, onSignOut, signOutRedirectPath])

  const handleSignOut = async () => {
    if (!isMounted()) {
      return
    }

    await signOut()
  }

  return (
    <button
      className="inline-flex items-center px-4 py-2 rounded-md bg-sky-700 text-white"
      disabled={isLoading}
      onClick={handleSignOut}
    >
      {isLoading && <Spinner size="sm" appendClassName="mr-1" />}
      <span>Sign Out</span>
    </button>
  )
}
