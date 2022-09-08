import type { NextPage } from 'next'

import { HomeIcon } from '@heroicons/react/24/outline'

import { SignInForm } from '../components/prefabs/SignInForm'
import { SignOutButton } from '../components/prefabs/SignOutButton'
import { useAuthSession } from '../context/SessionContextProvider'

export const IndexPage: NextPage = (_props) => {
  const session = useAuthSession(true)

  return (
    <div className="flex flex-col items-center">
      <HomeIcon className="h-20 w-auto text-slate-700" />

      {session ? (
        <div>
          <div>Hello {session.profile.name}</div>
          <SignOutButton />
        </div>
      ) : (
        <SignInForm />
      )}
    </div>
  )
}

export default IndexPage
