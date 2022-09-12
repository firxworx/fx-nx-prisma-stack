import type { NextPage } from 'next'
import { PageHeading } from '../components/elements/headings/PageHeading'

import { SignInForm } from '../components/prefabs/SignInForm'
import { SignOutButton } from '../components/prefabs/SignOutButton'
import { useSessionContext } from '../context/SessionContextProvider'

/**
 * Sign-in page.
 *
 * @see _app.tsx
 * @see PlaceholderLayout
 */
export const SignInPage: NextPage = (_props) => {
  const session = useSessionContext()

  return (
    <>
      <PageHeading>Sign In</PageHeading>
      {session?.profile ? (
        <div>
          <div>You are already signed in</div>
          <SignOutButton />
        </div>
      ) : (
        <div className="flex justify-center w-full">
          <SignInForm />
        </div>
      )}
    </>
  )
}

export default SignInPage
