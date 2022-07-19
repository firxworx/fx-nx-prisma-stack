import type { NextPage } from 'next'
import { SignInForm } from '../components/SignInForm'

export const SignInPage: NextPage = (_props) => {
  return (
    <div>
      <SignInForm />
    </div>
  )
}

export default SignInPage
