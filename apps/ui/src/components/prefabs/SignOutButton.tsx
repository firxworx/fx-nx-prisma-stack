import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useIsMounted } from '@firx/react-hooks'

import { useAuthSignOut } from '../../api/hooks/auth'
import { ActionButton } from '../elements/inputs/ActionButton'

export interface SignOutButtonProps {
  signOutRedirectPath?: string
  onSignOut?: () => Promise<unknown>
}

const LABELS = {
  SIGN_OUT: 'Sign Out',
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

  const handleSignOut = async (): Promise<void> => {
    if (!isMounted()) {
      return
    }

    await signOut()
  }

  return (
    <ActionButton isLoading={isLoading} onClick={handleSignOut}>
      {LABELS.SIGN_OUT}
    </ActionButton>
  )
}
