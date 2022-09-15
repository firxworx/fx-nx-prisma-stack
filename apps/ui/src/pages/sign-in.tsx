import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { PageHeading } from '../components/elements/headings/PageHeading'
import { NavLink } from '../components/elements/inputs/NavLink'

import { SignInForm } from '../components/prefabs/SignInForm'
import { SignOutButton } from '../components/prefabs/SignOutButton'
import { useSessionContext } from '../context/SessionContextProvider'
import { getValidatedPathUri } from '../lib/uri/paths'
import { getQueryStringValue } from '../lib/uri/query'

const HEADINGS = {
  SIGN_IN: 'Sign In',
}

const LABELS = {
  YOU_ARE_SIGNED_IN: 'You are signed in:',
  RETURN_TO: 'Return to: ',
}

/**
 * Sign-in page.
 *
 * @see _app.tsx
 * @see PlaceholderLayout
 */
export const SignInPage: NextPage = (_props) => {
  const session = useSessionContext()
  const router = useRouter()

  const redirectPath = getValidatedPathUri(getQueryStringValue(router.query?.redirect)) ?? ''

  return (
    <>
      <PageHeading>{HEADINGS.SIGN_IN}</PageHeading>
      {session?.profile ? (
        <div>
          <div className="mb-4">
            <span>
              {LABELS.YOU_ARE_SIGNED_IN} {session.profile.email}
            </span>
            {!!redirectPath && (
              <span className="block">
                {LABELS.RETURN_TO} <NavLink href={redirectPath}>{redirectPath}</NavLink>
              </span>
            )}
          </div>
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
