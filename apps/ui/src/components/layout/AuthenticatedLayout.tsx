import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

// import { BoxContextProvider } from '../../context/BoxContextProvider'

export const AuthenticatedLayout: React.FC<PropsWithChildren> = ({ children }) => {
  // example for accessing the authenticated user's name
  // const session = useAuthSession()
  // console.log(session.profile.name)

  return (
    // <BoxContextProvider>
    <div className="p-0 xs:p-4 sm:p-6 bg-slate-50">
      <div
        className={clsx(
          'mx-auto max-w-5xl px-4 py-6 xs:py-4 sm:p-8 w-full rounded-md',
          'border-0 xs:border xs:border-fx1-200 xs:shadow-sm bg-white',
        )}
      >
        {children}
      </div>
    </div>
    // </BoxContextProvider>
  )
}
