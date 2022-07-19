import type { PropsWithChildren } from 'react'
import { SignOutButton } from '../SignOutButton'
import { useSessionContext } from '../../context/SessionContextProvider'

export const ProtectedLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const session = useSessionContext()

  return (
    <main className="bg-green-300">
      <h1 className="text-2xl">Protected Layout</h1>
      <h2 className="text-base">Hello {session.name}</h2>
      <SignOutButton />
      <div>{children}</div>
    </main>
  )
}
