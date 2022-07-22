import { HomeIcon } from '@heroicons/react/outline'
import type { NextPage } from 'next'
import { SignInForm } from '../components/SignInForm'
import { useSessionContext } from '../context/SessionContextProvider'

export const IndexPage: NextPage = (_props) => {
  const session = useSessionContext(true)

  return (
    <div className="flex flex-col items-center">
      <HomeIcon className="h-20 w-auto text-slate-700" />
      <SignInForm onSignIn={async () => session?.refetch()} />
    </div>
  )
}

export default IndexPage
