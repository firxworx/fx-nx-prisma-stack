import type { NextPage } from 'next'

import { HomeIcon } from '@heroicons/react/24/outline'

import { SignInForm } from '../components/prefabs/SignInForm'
import { SignOutButton } from '../components/prefabs/SignOutButton'
import { useSessionContext } from '../context/SessionContextProvider'
import { PageHeading } from '../components/elements/headings/PageHeading'

export const IndexPage: NextPage = (_props) => {
  const session = useSessionContext()

  return (
    <>
      <PageHeading>{process.env.NEXT_PUBLIC_SITE_TITLE}</PageHeading>
      <div className="flex flex-col items-center">
        <HomeIcon className="h-20 w-auto text-slate-700" />

        {session?.profile ? (
          <div>
            <div>Hello {session.profile.name}</div>
            <SignOutButton />
          </div>
        ) : (
          <SignInForm />
        )}
      </div>
    </>
  )
}

export default IndexPage
