import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAsyncCallback } from 'react-async-hook'

import { signOut } from '../api/auth'
import { useIsMounted } from '../hooks/useIsMounted'

const SIGN_OUT_REDIRECT_PATH = '/'

export interface SignOutButtonProps {
  onSignOutRedirectPath?: string
  onSignOut?: () => Promise<unknown>
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({ onSignOutRedirectPath, onSignOut }) => {
  const isMounted = useIsMounted()
  const { push: routerPush } = useRouter()

  const signOutAsync = useAsyncCallback(async () => {
    await signOut()
    return true // require truthy result for logic in useEffect
  })

  useEffect(() => {
    if (isMounted() && signOutAsync.result) {
      if (typeof onSignOut === 'function') {
        onSignOut()
      }

      routerPush(onSignOutRedirectPath)
    }
  }, [signOutAsync.result, onSignOutRedirectPath, routerPush, isMounted, onSignOut])

  const handleSignOut = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      signOutAsync.execute()
    } catch (error: unknown) {
      console.error((error && error instanceof Error && error.message) || String(error))
    }
  }

  return (
    <button className="px-4 py-2 rounded-md bg-sky-700 text-white" onClick={handleSignOut}>
      Sign Out
    </button>
  )
}

SignOutButton.defaultProps = {
  onSignOutRedirectPath: SIGN_OUT_REDIRECT_PATH,
}
