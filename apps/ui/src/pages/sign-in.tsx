import type { NextPage } from 'next'
import { SignInForm } from '../components/SignInForm'
import { SignOutButton } from '../components/SignOutButton'
import { useSessionContext } from '../context/SessionContextProvider'

export const SignInPage: NextPage = (_props) => {
  const session = useSessionContext(true)

  return (
    <div>
      {session ? (
        <div>
          <div>Hello {session.session.name}, you are signed in.</div>
          <div className="mt-4">
            <SignOutButton onSignOut={() => Promise.resolve(session.remove())} />
          </div>
        </div>
      ) : (
        <SignInForm onSignIn={async () => session?.refetch()} />
      )}
    </div>
  )
}

export default SignInPage
