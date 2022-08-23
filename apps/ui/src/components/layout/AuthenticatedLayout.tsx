import type { PropsWithChildren } from 'react'

export const AuthenticatedLayout: React.FC<PropsWithChildren> = ({ children }) => {
  // example for accessing the authenticated user's name
  // const session = useAuthSession()
  // console.log(session.profile.name)

  return (
    <div className="p-4 sm:p-8 border-2 bg-slate-100 border-slate-200 rounded-md">
      <div>{children}</div>
    </div>
  )
}
