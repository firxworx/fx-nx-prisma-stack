import { HomeIcon } from '@heroicons/react/outline'
import type { NextPage } from 'next'
import { SignInForm } from '../components/SignInForm'
import { SignOutButton } from '../components/SignOutButton'
import { useAuthSession } from '../context/SessionContextProvider'

export const IndexPage: NextPage = (_props) => {
  const session = useAuthSession(true)

  return (
    <div className="flex flex-col items-center">
      <HomeIcon className="h-20 w-auto text-slate-700" />

      {session ? (
        <div>
          <div>Hello {session.session.name}</div>
          <SignOutButton />
        </div>
      ) : (
        <SignInForm />
      )}
    </div>
  )
}

export default IndexPage
