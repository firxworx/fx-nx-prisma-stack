import type { PropsWithChildren } from 'react'

import { useAuthSession } from '../../context/SessionContextProvider'
import { SignOutButton } from '../SignOutButton'

export const ProtectedLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const session = useAuthSession()

  return (
    <div className="bg-slate-100 p-4 sm:p-8 rounded-md">
      <h1 className="text-xl sm:text-2xl">Protected Layout</h1>
      <h2 className="text-base">Hello {session.session.name}</h2>
      <div className="my-4">
        <SignOutButton />
      </div>
      <div>{children}</div>
    </div>
  )
}
