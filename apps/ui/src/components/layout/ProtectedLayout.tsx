import type { PropsWithChildren } from 'react'

import { SignOutButton } from '../SignOutButton'
import { useSessionContext } from '../../context/SessionContextProvider'

export const ProtectedLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const session = useSessionContext()

  return (
    <div className="bg-slate-200 p-8 rounded-md">
      <h1 className="text-2xl">Protected Layout</h1>
      <h2 className="text-base">Hello {session.session.name}</h2>
      <SignOutButton onSignOut={() => session.refetch()} />
      <div>{children}</div>
    </div>
  )
}
