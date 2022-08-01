import type { PropsWithChildren } from 'react'

export const PublicLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="p-4 sm:p-8 border-2 bg-slate-100 border-slate-200 rounded-md">
      <h1 className="text-xl sm:text-2xl">Public Layout</h1>
      <div>{children}</div>
    </div>
  )
}
