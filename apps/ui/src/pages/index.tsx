import { HomeIcon } from '@heroicons/react/outline'
import type { NextPage } from 'next'
import { SignInForm } from '../components/SignInForm'

export const IndexPage: NextPage = (_props) => {
  return (
    <div className="flex flex-col items-center">
      <HomeIcon className="h-20 w-auto text-slate-800" />
      <SignInForm />
    </div>
  )
}

export default IndexPage
