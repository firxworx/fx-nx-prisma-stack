import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

export const PublicLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="p-0 xs:p-4 sm:p-6 bg-slate-50">
      <div
        className={clsx(
          'mx-auto max-w-5xl px-4 py-6 xs:py-4 sm:p-8 w-full rounded-md',
          'border-0 xs:border xs:border-dashed xs:border-fx1-200 xs:shadow-sm bg-white',
        )}
      >
        {children}
      </div>
    </div>
  )
}
