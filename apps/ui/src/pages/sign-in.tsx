import type { NextPage } from 'next'

import { SignInForm } from '../components/prefabs/SignInForm'

/**
 * Sign-in page.
 *
 * @see _app.tsx
 * @see PlaceholderLayout
 */
export const SignInPage: NextPage = (_props) => {
  return (
    <div className="flex justify-center w-full">
      <div>
        <h2>Sign In</h2>
        <SignInForm />
      </div>
    </div>
  )
}

export default SignInPage
