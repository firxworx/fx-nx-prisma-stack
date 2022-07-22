import type { NextPage } from 'next'
import { SignInForm } from '../components/SignInForm'
import { useSessionContext } from '../context/SessionContextProvider'

export const SignInPage: NextPage = (_props) => {
  const session = useSessionContext(true)

  return (
    <div>
      <SignInForm onSignIn={async () => session?.refetch()} />
    </div>
  )
}

export default SignInPage
